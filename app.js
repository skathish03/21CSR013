const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;

const API_ENDPOINTS = {
  p: 'http://20.244.56.144/test/primes',
  f: 'http://20.244.56.144/test/fibo',
  e: 'http://20.244.56.144/test/even',
  r: 'http://20.244.56.144/test/rand'
};

let window = [];

const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE4NjkxMzY0LCJpYXQiOjE3MTg2OTEwNjQsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImUzZTJhYzczLTNlM2EtNGVhYS1hZGY4LTg5OTJmMDNjNTk5ZSIsInN1YiI6ImF0aGlzaHNrLjIxY3NlQGtvbmd1LmVkdSJ9LCJjb21wYW55TmFtZSI6ImF0aGlzaHByb2oiLCJjbGllbnRJRCI6ImUzZTJhYzczLTNlM2EtNGVhYS1hZGY4LTg5OTJmMDNjNTk5ZSIsImNsaWVudFNlY3JldCI6IndmUmtPS1lqaFlNRnVzUHQiLCJvd25lck5hbWUiOiJhdGhpc2giLCJvd25lckVtYWlsIjoiYXRoaXNoc2suMjFjc2VAa29uZ3UuZWR1Iiwicm9sbE5vIjoiMjFDU1IwMTMifQ.qMEK2Y8KUNLZXBQWKHsgJn8PlPkaBzamgzxVIjWTop0';

const getUniqueNumbers = (existingNumbers, newNumbers) => {
  const uniqueNumbers = newNumbers.filter(num => !existingNumbers.includes(num));
  return uniqueNumbers;
};

const calculateAverage = (numbers) => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
};

const fetchAndCalculateNumbers = async (type, window, windowSize) => {
  try {
    const url = API_ENDPOINTS[type];
    if (!url) throw new Error('Invalid type');
    
    const response = await axios.get(url, {
      timeout: 500,
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`
      }
    });
    const fetchedNumbers = response.data.numbers;

    const uniqueNumbers = getUniqueNumbers(window, fetchedNumbers);
    window.push(...uniqueNumbers);

    if (window.length > windowSize) {
      window.splice(0, window.length - windowSize);
    }

    const avg = calculateAverage(window);
    return { numbers: window, avg };
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch numbers');
  }
};

app.get('/numbers/:numberid', async (req, res) => {
  const { numberid } = req.params;
  try {
    const { numbers, avg } = await fetchAndCalculateNumbers(numberid, window, WINDOW_SIZE);
    res.json({
      windowPrevState: [...window],
      windowCurrState: [...numbers],
      numbers: numbers.slice(-WINDOW_SIZE),
      avg: avg.toFixed(2)
    });
  } catch (error) {
    res.status(500).send('Error fetching numbers');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
