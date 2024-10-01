import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class Common extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new cdk.aws_ec2.Vpc(this, "Vpc", {
      natGateways: 0,
    });

    const defaultDatabaseName = "postgres";
    const dbCluster = new cdk.aws_rds.DatabaseCluster(this, "Database", {
      vpc,
      engine: cdk.aws_rds.DatabaseClusterEngine.auroraPostgres({
        version: cdk.aws_rds.AuroraPostgresEngineVersion.VER_16_3,
      }),
      defaultDatabaseName,
      enableDataApi: true,
      writer: cdk.aws_rds.ClusterInstance.serverlessV2("Writer", {}),
      subnetGroup: new cdk.aws_rds.SubnetGroup(this, "SubnetGroup", {
        vpc,
        vpcSubnets: { subnetType: cdk.aws_ec2.SubnetType.PRIVATE_ISOLATED },
        description: "Database Subnet Group",
      }),
    });

    const frontendFunction = new cdk.aws_lambda.DockerImageFunction(
      this,
      "FrontendFunction",
      {
        code: cdk.aws_lambda.DockerImageCode.fromImageAsset("../frontend"),
        architecture: cdk.aws_lambda.Architecture.ARM_64,
        memorySize: 2048,
        timeout: cdk.Duration.minutes(5),
        environment: {
          DATABASE: defaultDatabaseName,
          SECRET_ARN: dbCluster.secret?.secretArn!,
          RESOURCE_ARN: dbCluster.clusterArn,
        },
      }
    );
    dbCluster.grantDataApiAccess(frontendFunction);

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
