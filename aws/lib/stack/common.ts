import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class Common extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const frontendFunction = new cdk.aws_lambda.DockerImageFunction(
      this,
      "FrontendFunction",
      {
        code: cdk.aws_lambda.DockerImageCode.fromImageAsset("../frontend"),
        architecture: cdk.aws_lambda.Architecture.ARM_64,
        memorySize: 2048,
        timeout: cdk.Duration.minutes(5),
      }
    );

    const functionUrl = frontendFunction.addFunctionUrl({
      authType: cdk.aws_lambda.FunctionUrlAuthType.AWS_IAM,
    });

    const distribution = new cdk.aws_cloudfront.Distribution(
      this,
      "Distribution",
      {
        defaultBehavior: {
          origin: new cdk.aws_cloudfront_origins.FunctionUrlOrigin(functionUrl),
          allowedMethods: cdk.aws_cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cdk.aws_cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy:
            cdk.aws_cloudfront.OriginRequestPolicy
              .ALL_VIEWER_EXCEPT_HOST_HEADER,
        },
      }
    );
    new cdk.CfnOutput(this, "DistributionDnsName", {
      value: `https://${distribution.domainName}`,
    });

    const cfnOriginAccessControl =
      new cdk.aws_cloudfront.CfnOriginAccessControl(
        this,
        "OriginAccessControl",
        {
          originAccessControlConfig: {
            name: "Origin Access Control for Lambda Functions URL",
            originAccessControlOriginType: "lambda",
            signingBehavior: "always",
            signingProtocol: "sigv4",
          },
        }
      );

    const cfnDistribution = distribution.node
      .defaultChild as cdk.aws_cloudfront.CfnDistribution;
    cfnDistribution.addPropertyOverride(
      "DistributionConfig.Origins.0.OriginAccessControlId",
      cfnOriginAccessControl.attrId
    );

    frontendFunction.addPermission("CloudFrontLambdaIntegration", {
      principal: new cdk.aws_iam.ServicePrincipal("cloudfront.amazonaws.com"),
      action: "lambda:InvokeFunctionUrl",
      sourceArn: `arn:aws:cloudfront::${
        cdk.Stack.of(this).account
      }:distribution/${distribution.distributionId}`,
    });
  }
}
