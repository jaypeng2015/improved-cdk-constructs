"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsiteStack = void 0;
const iam = require("aws-cdk-lib/aws-iam");
const ssm = require("aws-cdk-lib/aws-ssm");
const route53 = require("aws-cdk-lib/aws-route53");
const acm = require("aws-cdk-lib/aws-certificatemanager");
const cloudfront = require("aws-cdk-lib/aws-cloudfront");
const targets = require("aws-cdk-lib/aws-route53-targets");
const s3 = require("aws-cdk-lib/aws-s3");
const cdk = require("aws-cdk-lib");
class WebsiteStack extends cdk.Stack {
    constructor(scope, id, config, props) {
        var _a;
        super(scope, id, props);
        this.config = config;
        const hostingBucket = new s3.Bucket(this, this.config.website.bucket.bucketName, {
            bucketName: this.config.website.bucket.bucketName,
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: 'error.html',
            publicReadAccess: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            enforceSSL: true,
            encryption: s3.BucketEncryption.S3_MANAGED,
        });
        hostingBucket.grantReadWrite(new iam.ArnPrincipal(`arn:aws:iam::${cdk.Stack.of(this).account}:role/buildkite-deployment-role`));
        const acmArn = ssm.StringParameter.valueForStringParameter(this, `/acm/${this.config.website.domain}`);
        const certificate = acm.Certificate.fromCertificateArn(this, "Certificate", acmArn);
        const al = this.config.website.certificateAliases ? [this.config.website.domain, ...this.config.website.certificateAliases] : [this.config.website.domain];
        const cf = new cloudfront.CloudFrontWebDistribution(this, 'WebDistribution', {
            comment: this.config.website.domain,
            originConfigs: [
                {
                    s3OriginSource: {
                        s3BucketSource: hostingBucket,
                    },
                    behaviors: [{ isDefaultBehavior: true },],
                },
            ],
            errorConfigurations: [
                {
                    errorCode: 403,
                    responseCode: 200,
                    responsePagePath: '/index.html',
                },
            ],
            viewerCertificate: cloudfront.ViewerCertificate.fromAcmCertificate(certificate, { aliases: al }),
        });
        var d;
        if (this.config.website.ignorePrefix && this.config.website.domain.startsWith(this.config.website.ignorePrefix)) {
            d = this.config.website.domain.split(".").slice(1).join(".");
        }
        else {
            d = this.config.website.domain;
        }
        const zoneId = ssm.StringParameter.valueForStringParameter(this, `/route53/${d}/zone`);
        const zone = route53.HostedZone.fromHostedZoneAttributes(this, "DomainHostedZone", {
            zoneName: d,
            hostedZoneId: zoneId,
        });
        // // Adding out A Record code
        new route53.ARecord(this, "CDNARecord", {
            recordName: this.config.website.domain,
            ttl: cdk.Duration.seconds(60),
            zone,
            target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(cf)),
        });
        new route53.AaaaRecord(this, "AliasRecord", {
            recordName: this.config.website.domain,
            ttl: cdk.Duration.seconds(60),
            zone,
            target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(cf)),
        });
        (_a = this.config.website.addtionalARecords) === null || _a === void 0 ? void 0 : _a.map(r => {
            new route53.ARecord(this, `${r.recordName}CDNARecord`, {
                recordName: r.recordName,
                ttl: cdk.Duration.seconds(r.ttl),
                zone,
                target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(cf)),
            });
        });
    }
}
exports.WebsiteStack = WebsiteStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vic2l0ZVN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsid2Vic2l0ZVN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJDQUE0QztBQUM1QywyQ0FBNEM7QUFDNUMsbURBQW9EO0FBQ3BELDBEQUEyRDtBQUMzRCx5REFBMEQ7QUFDMUQsMkRBQTREO0FBQzVELHlDQUEwQztBQUMxQyxtQ0FBb0M7QUFLcEMsTUFBYSxZQUFhLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFJdkMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxNQUFxQixFQUFFLEtBQXNCOztRQUNuRixLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUVyQixNQUFNLGFBQWEsR0FBRyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUU7WUFDN0UsVUFBVSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFVO1lBQ2pELG9CQUFvQixFQUFFLFlBQVk7WUFDbEMsb0JBQW9CLEVBQUUsWUFBWTtZQUNsQyxnQkFBZ0IsRUFBRSxJQUFJO1lBQ3RCLGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU87WUFDeEMsVUFBVSxFQUFFLElBQUk7WUFDaEIsVUFBVSxFQUFFLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVO1NBQzdDLENBQUMsQ0FBQTtRQUVGLGFBQWEsQ0FBQyxjQUFjLENBQUMsSUFBSSxHQUFHLENBQUMsWUFBWSxDQUFDLGdCQUFnQixHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLGlDQUFpQyxDQUFDLENBQUMsQ0FBQTtRQUUvSCxNQUFNLE1BQU0sR0FBRyxHQUFHLENB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VSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU07WUFDdEMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUM3QixJQUFJO1lBQ0osTUFBTSxFQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksT0FBTyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQzNFLENBQUMsQ0FBQztRQUVILE1BQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsaUJBQWlCLDBDQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUMzQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLFVBQVUsWUFBWSxFQUFFO2dCQUNuRCxVQUFVLEVBQUUsQ0FBQyxDQUFDLFVBQVU7Z0JBQ3hCLEdBQUcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO2dCQUNoQyxJQUFJO2dCQUNKLE1BQU0sRUFBRSxPQUFPLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUMzRSxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQTtJQUNOLENBQUM7Q0FDSjtBQTdGRCxvQ0E2RkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaWFtID0gcmVxdWlyZSgnYXdzLWNkay1saWIvYXdzLWlhbScpO1xuaW1wb3J0IHNzbSA9IHJlcXVpcmUoJ2F3cy1jZGstbGliL2F3cy1zc20nKTtcbmltcG9ydCByb3V0ZTUzID0gcmVxdWlyZSgnYXdzLWNkay1saWIvYXdzLXJvdXRlNTMnKTtcbmltcG9ydCBhY20gPSByZXF1aXJlKCdhd3MtY2RrLWxpYi9hd3MtY2VydGlmaWNhdGVtYW5hZ2VyJyk7XG5pbXBvcnQgY2xvdWRmcm9udCA9IHJlcXVpcmUoJ2F3cy1jZGstbGliL2F3cy1jbG91ZGZyb250Jyk7XG5pbXBvcnQgdGFyZ2V0cyA9IHJlcXVpcmUoJ2F3cy1jZGstbGliL2F3cy1yb3V0ZTUzLXRhcmdldHMnKTtcbmltcG9ydCBzMyA9IHJlcXVpcmUoJ2F3cy1jZGstbGliL2F3cy1zMycpO1xuaW1wb3J0IGNkayA9IHJlcXVpcmUoJ2F3cy1jZGstbGliJyk7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCB7IFdlYnNpdGVDb25maWcgfSBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL2xpYi93ZWJzaXRlL2ludGVyZmFjZXMnO1xuXG5cbmV4cG9ydCBjbGFzcyBXZWJzaXRlU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuXG4gICAgY29uZmlnOiBXZWJzaXRlQ29uZmlnO1xuXG4gICAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgY29uZmlnOiBXZWJzaXRlQ29uZmlnLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuXG4gICAgICAgIGNvbnN0IGhvc3RpbmdCdWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsIHRoaXMuY29uZmlnLndlYnNpdGUuYnVja2V0LmJ1Y2tldE5hbWUsIHtcbiAgICAgICAgICAgIGJ1Y2tldE5hbWU6IHRoaXMuY29uZmlnLndlYnNpdGUuYnVja2V0LmJ1Y2tldE5hbWUsXG4gICAgICAgICAgICB3ZWJzaXRlSW5kZXhEb2N1bWVudDogJ2luZGV4Lmh0bWwnLFxuICAgICAgICAgICAgd2Vic2l0ZUVycm9yRG9jdW1lbnQ6ICdlcnJvci5odG1sJywgLy8gQ2xvdWRGb3JtYXRpb24gZG9lc24ndCByZXF1aXJlIHRoaXMgYnV0IHRoZSBTMyBjb25zb2xlIHVpIGRvZXNcbiAgICAgICAgICAgIHB1YmxpY1JlYWRBY2Nlc3M6IHRydWUsXG4gICAgICAgICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgICAgICAgICAgZW5mb3JjZVNTTDogdHJ1ZSxcbiAgICAgICAgICAgIGVuY3J5cHRpb246IHMzLkJ1Y2tldEVuY3J5cHRpb24uUzNfTUFOQUdFRCxcbiAgICAgICAgfSlcblxuICAgICAgICBob3N0aW5nQnVja2V0LmdyYW50UmVhZFdyaXRlKG5ldyBpYW0uQXJuUHJpbmNpcGFsKGBhcm46YXdzOmlhbTo6JHtjZGsuU3RhY2sub2YodGhpcykuYWNjb3VudH06cm9sZS9idWlsZGtpdGUtZGVwbG95bWVudC1yb2xlYCkpXG5cbiAgICAgICAgY29uc3QgYWNtQXJuID0gc3NtLlN0cmluZ1BhcmFtZXRlci52YWx1ZUZvclN0cmluZ1BhcmFtZXRlcihcbiAgICAgICAgICAgIHRoaXMsIGAvYWNtLyR7dGhpcy5jb25maWcud2Vic2l0ZS5kb21haW59YFxuICAgICAgICApXG5cbiAgICAgICAgY29uc3QgY2VydGlmaWNhdGUgPSBhY20uQ2VydGlmaWNhdGUuZnJvbUNlcnRpZmljYXRlQXJuKHRoaXMsIFwiQ2VydGlmaWNhdGVcIiwgYWNtQXJuKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGFsID0gdGhpcy5jb25maWcud2Vic2l0ZS5jZXJ0aWZpY2F0ZUFsaWFzZXMgPyBbdGhpcy5jb25maWcud2Vic2l0ZS5kb21haW4sIC4uLnRoaXMuY29uZmlnLndlYnNpdGUuY2VydGlmaWNhdGVBbGlhc2VzXTogW3RoaXMuY29uZmlnLndlYnNpdGUuZG9tYWluXVxuXG4gICAgICAgIGNvbnN0IGNmID0gbmV3IGNsb3VkZnJvbnQuQ2xvdWRGcm9udFdlYkRpc3RyaWJ1dGlvbih0aGlzLCAnV2ViRGlzdHJpYnV0aW9uJywge1xuICAgICAgICAgICAgY29tbWVudDogdGhpcy5jb25maWcud2Vic2l0ZS5kb21haW4sXG4gICAgICAgICAgICBvcmlnaW5Db25maWdzOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBzM09yaWdpblNvdXJjZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgczNCdWNrZXRTb3VyY2U6IGhvc3RpbmdCdWNrZXQsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGJlaGF2aW9yczogW3sgaXNEZWZhdWx0QmVoYXZpb3I6IHRydWUgfSxdLFxuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBlcnJvckNvbmZpZ3VyYXRpb25zOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBlcnJvckNvZGU6IDQwMyxcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2VDb2RlOiAyMDAsXG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlUGFnZVBhdGg6ICcvaW5kZXguaHRtbCcsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG5cbiAgICAgICAgICAgIHZpZXdlckNlcnRpZmljYXRlOiBjbG91ZGZyb250LlZpZXdlckNlcnRpZmljYXRlLmZyb21BY21DZXJ0aWZpY2F0ZShjZXJ0aWZpY2F0ZSwgeyBhbGlhc2VzOiBhbCB9KSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGQ6IHN0cmluZ1xuXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy53ZWJzaXRlLmlnbm9yZVByZWZpeCAmJiB0aGlzLmNvbmZpZy53ZWJzaXRlLmRvbWFpbi5zdGFydHNXaXRoKHRoaXMuY29uZmlnLndlYnNpdGUuaWdub3JlUHJlZml4KSkge1xuICAgICAgICAgICAgZCA9IHRoaXMuY29uZmlnLndlYnNpdGUuZG9tYWluLnNwbGl0KFwiLlwiKS5zbGljZSgxKS5qb2luKFwiLlwiKTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZCA9IHRoaXMuY29uZmlnLndlYnNpdGUuZG9tYWluXG4gICAgICAgIH1cbiAgICAgICAgXG5cbiAgICAgICAgY29uc3Qgem9uZUlkID0gc3NtLlN0cmluZ1BhcmFtZXRlci52YWx1ZUZvclN0cmluZ1BhcmFtZXRlcih0aGlzLCBgL3JvdXRlNTMvJHtkfS96b25lYClcbiAgICAgICAgY29uc3Qgem9uZSA9IHJvdXRlNTMuSG9zdGVkWm9uZS5mcm9tSG9zdGVkWm9uZUF0dHJpYnV0ZXModGhpcywgXCJEb21haW5Ib3N0ZWRab25lXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgem9uZU5hbWU6IGQsXG4gICAgICAgICAgICAgICAgaG9zdGVkWm9uZUlkOiB6b25lSWQsXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gLy8gQWRkaW5nIG91dCBBIFJlY29yZCBjb2RlXG4gICAgICAgIG5ldyByb3V0ZTUzLkFSZWNvcmQodGhpcywgXCJDRE5BUmVjb3JkXCIsIHtcbiAgICAgICAgICAgIHJlY29yZE5hbWU6IHRoaXMuY29uZmlnLndlYnNpdGUuZG9tYWluLFxuICAgICAgICAgICAgdHRsOiBjZGsuRHVyYXRpb24uc2Vjb25kcyg2MCksXG4gICAgICAgICAgICB6b25lLFxuICAgICAgICAgICAgdGFyZ2V0OiByb3V0ZTUzLlJlY29yZFRhcmdldC5mcm9tQWxpYXMobmV3IHRhcmdldHMuQ2xvdWRGcm9udFRhcmdldChjZikpLFxuICAgICAgICB9KTtcblxuICAgICAgICBuZXcgcm91dGU1My5BYWFhUmVjb3JkKHRoaXMsIFwiQWxpYXNSZWNvcmRcIiwge1xuICAgICAgICAgICAgcmVjb3JkTmFtZTogdGhpcy5jb25maWcud2Vic2l0ZS5kb21haW4sXG4gICAgICAgICAgICB0dGw6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDYwKSxcbiAgICAgICAgICAgIHpvbmUsXG4gICAgICAgICAgICB0YXJnZXQ6IHJvdXRlNTMuUmVjb3JkVGFyZ2V0LmZyb21BbGlhcyhuZXcgdGFyZ2V0cy5DbG91ZEZyb250VGFyZ2V0KGNmKSksXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuY29uZmlnLndlYnNpdGUuYWRkdGlvbmFsQVJlY29yZHM/Lm1hcChyID0+IHtcbiAgICAgICAgICAgIG5ldyByb3V0ZTUzLkFSZWNvcmQodGhpcywgYCR7ci5yZWNvcmROYW1lfUNETkFSZWNvcmRgLCB7XG4gICAgICAgICAgICAgICAgcmVjb3JkTmFtZTogci5yZWNvcmROYW1lLFxuICAgICAgICAgICAgICAgIHR0bDogY2RrLkR1cmF0aW9uLnNlY29uZHMoci50dGwpLFxuICAgICAgICAgICAgICAgIHpvbmUsXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiByb3V0ZTUzLlJlY29yZFRhcmdldC5mcm9tQWxpYXMobmV3IHRhcmdldHMuQ2xvdWRGcm9udFRhcmdldChjZikpLFxuICAgICAgICAgICAgfSk7IFxuICAgICAgICB9KVxuICAgIH1cbn1cbiJdfQ==