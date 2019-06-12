provider "aws" {
    region = "us-east-1"
    #Credentials are left empty, just set them before you run. 
    # $ export AWS_ACCESS_KEY_ID="anaccesskey"
    # $ export AWS_SECRET_ACCESS_KEY="asecretkey"
    # $ export AWS_DEFAULT_REGION="us-west-2"
    # $ terraform plan
}

#Setup for lambda function
data "aws_iam_role" "iam_for_snapshot_lambda" {
    name = "iam_for_snapshot_lambda"
    assume_role_policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "s3:ListBucket",
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:GetObject"
            ],
            "Effect": "Allow"
        }
    ]
}
EOF

}

resource "aws_lambda_layer_version" "modules" {
    filename = "snapshot_layer_payload.zip"
    layer_name = "snapshot_layer"
    description = "all the node modules we need to run, here to make deployments faster." 

    compatible_runtimes = ["nodejs8.10", "nodejs6.10"]
}

resource "aws_lambda_function" "take_snapshot" {
    filename = "function.zip"
    function_name = "barrons-snapshots"
    role = "${data.aws_iam_role.iam_for_snapshot_lambda.arn}"
    handler = "index.handler"
    source_code_hash = "${filebase64sha256("function.zip")}"
    runtime = "nodejs8.10"
    publish = "true"
    timeout = "600" # Ten minutes

    layers = ["${aws_lambda_layer_version.modules.arn}"]

    environment {
        variables = {
            SAVE_BUCKET = "snapshot-bucket",
            FETCH_BUCKET = " djcs-wsjlite-nonprod"
        }
    }

    #TODO: Clean up tags  
    tags = {
        Name = "Snapshot Function"
        Environment = "dev"
    }
}

# TODO: Create cloudwatch stuff to run lambda automatically

# Storage configuration
resource "aws_s3_bucket" "save-bucket" {
    bucket = "snapshot-bucket"
    acl = "private"

    tags = {
        Name = "Snapshot Bucket"
        Environment = "Dev"
    }
}

# No fetch-bucket definition because it already exists! It was made for the website duh. 
