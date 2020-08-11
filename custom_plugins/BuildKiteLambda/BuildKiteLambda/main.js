'use strict'

const axios = require("axios");

exports.handler = function (event, context, callback) {

  const url = 'https://api.buildkite.com/v2/organizations/afterpay-paylater/pipelines/run-e2e-cd-test/builds?branch=master';

  const token = 'token';

  axios.get(url, {
    headers: {
      Authorization: 'Bearer ' + token
   }}).then((response) => {

      var response = {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin' : '*',
          'Access-Control-Allow-Credentials' : true
        },
        body: JSON.stringify(response.data)
      }

      callback(null, response)

  }).catch((error) => {
      console.error(`Error`)
  })
}
