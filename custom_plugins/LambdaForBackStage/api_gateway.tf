resource "aws_api_gateway_rest_api" "example" {
  name        = "ServerlessExample"
  description = "Terraform Serverless Application Example"
}

 resource "aws_api_gateway_resource" "proxy" {
   rest_api_id = aws_api_gateway_rest_api.example.id
   parent_id   = aws_api_gateway_rest_api.example.root_resource_id
   path_part   = "{proxy+}"
}


// To handle any path
resource "aws_api_gateway_method" "proxy" {
   rest_api_id   = aws_api_gateway_rest_api.example.id
   resource_id   = aws_api_gateway_resource.proxy.id
   http_method   = "GET"
   authorization = "NONE"
 }

 resource "aws_api_gateway_integration" "lambda" {
   rest_api_id = aws_api_gateway_rest_api.example.id
   resource_id = aws_api_gateway_method.proxy.resource_id
   http_method = aws_api_gateway_method.proxy.http_method

   integration_http_method = "POST"
   type                    = "AWS_PROXY"
   uri                     = aws_lambda_function.example.invoke_arn
 }


// To handle empty path
  resource "aws_api_gateway_method" "proxy_root" {
   rest_api_id   = aws_api_gateway_rest_api.example.id
   resource_id   = aws_api_gateway_rest_api.example.root_resource_id
   http_method   = "GET"
   authorization = "NONE"
 }

 resource "aws_api_gateway_integration" "lambda_root" {
   rest_api_id = aws_api_gateway_rest_api.example.id
   resource_id = aws_api_gateway_method.proxy_root.resource_id
   http_method = aws_api_gateway_method.proxy_root.http_method

   integration_http_method = "POST"
   type                    = "AWS_PROXY"
   uri                     = aws_lambda_function.example.invoke_arn
 }


// Expose the URL and activate the config
 resource "aws_api_gateway_deployment" "example" {
   depends_on = [
     aws_api_gateway_integration.lambda,
     aws_api_gateway_integration.lambda_root,
   ]

   rest_api_id = aws_api_gateway_rest_api.example.id
   stage_name  = "test"
 }

// https://medium.com/@MrPonath/terraform-and-aws-api-gateway-a137ee48a8ac

resource "aws_api_gateway_method" "options_method" {
    rest_api_id   = aws_api_gateway_rest_api.example.id
    resource_id   = aws_api_gateway_rest_api.example.root_resource_id
    http_method   = "OPTIONS"
    authorization = "NONE"
}
resource "aws_api_gateway_method_response" "options_200" {
    rest_api_id   = aws_api_gateway_rest_api.example.id
    resource_id   = aws_api_gateway_rest_api.example.root_resource_id
    http_method   = aws_api_gateway_method.options_method.http_method
    status_code   = "200"
    response_models = {
        "application/json" = "Empty"
    }
    response_parameters = {
        "method.response.header.Access-Control-Allow-Headers" = true,
        "method.response.header.Access-Control-Allow-Methods" = true,
        "method.response.header.Access-Control-Allow-Origin" = true
    }
    depends_on = [aws_api_gateway_method.options_method]
}
resource "aws_api_gateway_integration" "options_integration" {
    rest_api_id   = aws_api_gateway_rest_api.example.id
    resource_id   = aws_api_gateway_rest_api.example.root_resource_id
    http_method   = aws_api_gateway_method.options_method.http_method
    type          = "MOCK"
    depends_on = [aws_api_gateway_method.options_method]
}
resource "aws_api_gateway_integration_response" "options_integration_response" {
    rest_api_id   = aws_api_gateway_rest_api.example.id
    resource_id   = aws_api_gateway_rest_api.example.root_resource_id
    http_method   = aws_api_gateway_method.options_method.http_method
    status_code   = aws_api_gateway_method_response.options_200.status_code
    response_parameters = {
        "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
        "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT'",
        "method.response.header.Access-Control-Allow-Origin" = "'*'"
    }
    depends_on = [aws_api_gateway_method_response.options_200]
}




// outputs
 output "base_url" {
  value = aws_api_gateway_deployment.example.invoke_url
}