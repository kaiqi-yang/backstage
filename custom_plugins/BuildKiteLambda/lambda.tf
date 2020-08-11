provider "aws" {
  region  = "ap-southeast-2"
  profile = "saml"
}

resource "aws_lambda_function" "BuildKiteLambda" {
  function_name = "BuildKiteLambda"

  # The bucket name as created earlier with "aws s3api create-bucket"
  #    s3_bucket = "terraform-serverless-example"
  #    s3_key    = "v1.0.0/example.zip"

  filename         = "BuildKiteLambda.zip"
  source_code_hash = filebase64sha256("BuildKiteLambda.zip")
  #   hash     = data.archive_file.lambda_zip.output_base64sha256

  # "main" is the filename within the zip file (main.js) and "handler"
  # is the name of the property under which the handler function was
  # exported in that file.
  handler = "main.handler"
  runtime = "nodejs10.x"

  timeout = 30

  role = aws_iam_role.lambda_exec.arn
}

# IAM role which dictates what other AWS services the Lambda function
# may access.
resource "aws_iam_role" "lambda_exec" {
  name = "serverless_BuildKiteLambda_lambda"

  assume_role_policy = <<EOF
{
"Version": "2012-10-17",
"Statement": [
    {
    "Action": "sts:AssumeRole",
    "Principal": {
        "Service": "lambda.amazonaws.com"
    },
    "Effect": "Allow",
    "Sid": ""
    }
]
}
 EOF

}

# # define a zip archive
# data "archive_file" "lambda_zip" {
#   type        = "zip"
#   output_path = "example.zip"
#   # ... define the source
# }

 resource "aws_lambda_permission" "apigw" {
   statement_id  = "AllowAPIGatewayInvoke"
   action        = "lambda:InvokeFunction"
   function_name = aws_lambda_function.BuildKiteLambda.function_name
   principal     = "apigateway.amazonaws.com"

   # The "/*/*" portion grants access from any method on any resource
   # within the API Gateway REST API.
   source_arn = "${aws_api_gateway_rest_api.BuildKiteLambda.execution_arn}/*/*"
 }