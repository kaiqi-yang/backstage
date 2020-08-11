following https://learn.hashicorp.com/terraform/aws/lambda-api-gateway

Step of deployment

```
cd BuildKiteLambda

npm init
npm install axios@0.19.2

zip ../BuildKiteLambda.zip main.js
zip ../BuildKiteLambda.zip -r node_modules
zip ../BuildKiteLambda.zip package-lock.json
zip ../BuildKiteLambda.zip package.json

cd ..

terraform init

terraform apply
```

After creating the func and before the api gateway, can verify the output using:

```
aws lambda invoke --region=us-east-1 --function-name=ServerlessExample output.txt
{
    "StatusCode": 200,
    "ExecutedVersion": "$LATEST"
}
```

- To start
  - Run `npm install` inside of the lambda function folder
    - Because you need to package the node_module as well.
