"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ECRStack = void 0;
const cdk = require("aws-cdk-lib");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_ecr_1 = require("aws-cdk-lib/aws-ecr");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
class ECRStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, config, props) {
        super(scope, id);
        this.config = config;
        for (let repo of this.config.repos) {
            const r = new aws_ecr_1.Repository(this, `Repo${repo.repositoryName.replace("-", "")}`, {
                repositoryName: repo.repositoryName,
            });
            r.addToResourcePolicy(new aws_iam_1.PolicyStatement({
                effect: aws_iam_1.Effect.ALLOW,
                actions: [
                    "ecr:GetDownloadUrlForLayer",
                    "ecr:BatchGetImage",
                    "ecr:BatchCheckLayerAvailability",
                    "ecr:PutImage",
                    "ecr:InitiateLayerUpload",
                    "ecr:UploadLayerPart",
                    "ecr:CompleteLayerUpload"
                ],
                principals: repo.allowAccountAccess.map(a => {
                    return new aws_iam_1.AccountPrincipal(a);
                }),
                sid: "AllowAccountAccess"
            }));
            if (repo.lambdaContainer) {
                r.addToResourcePolicy(new aws_iam_1.PolicyStatement({
                    effect: aws_iam_1.Effect.ALLOW,
                    actions: [
                        "ecr:GetDownloadUrlForLayer",
                        "ecr:BatchGetImage",
                    ],
                    principals: [
                        new aws_iam_1.ServicePrincipal('lambda.amazonaws.com'),
                    ],
                    sid: "LambdaECRImageRetrievalPolicy"
                }));
            }
            if (repo.rules)
                repo.rules.forEach((rule) => {
                    if (rule.maxImageCount) {
                        r.addLifecycleRule({ tagPrefixList: rule.tagPrefix, maxImageCount: rule.maxImageCount });
                    }
                    else if (rule.maxAge) {
                        r.addLifecycleRule({ tagPrefixList: rule.tagPrefix, maxImageAge: cdk.Duration.days(rule.maxAge) });
                    }
                });
        }
        // >>TODO this doesnt work - There is PR open for lookup function on CDK repo
        // Add access for any existing repos
        // for (let rep of this.config.existingRepos) {
        //   const r = Repository.(
        //     this, `Repo${rep.repositoryName.replace("-", "")}`, rep.repositoryName
        //   )
        //   r.addToResourcePolicy(new PolicyStatement({
        //     effect: Effect.ALLOW,
        //     actions: [
        //       "ecr:GetDownloadUrlForLayer",
        //       "ecr:BatchGetImage",
        //       "ecr:BatchCheckLayerAvailability",
        //       "ecr:PutImage",
        //       "ecr:InitiateLayerUpload",
        //       "ecr:UploadLayerPart",
        //       "ecr:CompleteLayerUpload"
        //     ],
        //     principals: rep.allowAccountAccess.map(a => {
        //       return new AccountPrincipal(a)
        //     }),
        //     sid: "AllowAccountAccessA"
        //   }))
        // }
    }
}
exports.ECRStack = ECRStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWNyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZWNyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFvQztBQUNwQyw2Q0FBb0M7QUFDcEMsaURBQWlEO0FBR2pELGlEQUFrRztBQUdsRyxNQUFhLFFBQVMsU0FBUSxtQkFBSztJQUlqQyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLE1BQWMsRUFBRSxLQUFzQjtRQUM5RSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBRXJCLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUU7WUFFbEMsTUFBTSxDQUFDLEdBQUcsSUFBSSxvQkFBVSxDQUFDLElBQUksRUFBRSxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUM1RSxjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWM7YUFDcEMsQ0FBQyxDQUFBO1lBRUYsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLElBQUkseUJBQWUsQ0FBQztnQkFDeEMsTUFBTSxFQUFFLGdCQUFNLENBQUMsS0FBSztnQkFDcEIsT0FBTyxFQUFFO29CQUNQLDRCQUE0QjtvQkFDNUIsbUJBQW1CO29CQUNuQixpQ0FBaUM7b0JBQ2pDLGNBQWM7b0JBQ2QseUJBQXlCO29CQUN6QixxQkFBcUI7b0JBQ3JCLHlCQUF5QjtpQkFDMUI7Z0JBQ0QsVUFBVSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQzFDLE9BQU8sSUFBSSwwQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQTtnQkFDaEMsQ0FBQyxDQUFDO2dCQUNGLEdBQUcsRUFBRSxvQkFBb0I7YUFDMUIsQ0FBQyxDQUFDLENBQUE7WUFFSCxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7Z0JBQ3hCLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLHlCQUFlLENBQUM7b0JBQ3hDLE1BQU0sRUFBRSxnQkFBTSxDQUFDLEtBQUs7b0JBQ3BCLE9BQU8sRUFBRTt3QkFDUCw0QkFBNEI7d0JBQzVCLG1CQUFtQjtxQkFDcEI7b0JBQ0QsVUFBVSxFQUFFO3dCQUNWLElBQUksMEJBQWdCLENBQUMsc0JBQXNCLENBQUM7cUJBQzdDO29CQUNELEdBQUcsRUFBRSwrQkFBK0I7aUJBQ3JDLENBQUMsQ0FBQyxDQUFBO2FBQ0o7WUFDRCxJQUFJLElBQUksQ0FBQyxLQUFLO2dCQUNaLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7b0JBQzFCLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTt3QkFDdEIsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFBO3FCQUN6Rjt5QkFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7d0JBQ3RCLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLGFBQWEsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO3FCQUNuRztnQkFDSCxDQUFDLENBQUMsQ0FBQTtTQUNMO1FBRUQsNkVBQTZFO1FBQzdFLG9DQUFvQztRQUNwQywrQ0FBK0M7UUFFL0MsMkJBQTJCO1FBQzNCLDZFQUE2RTtRQUM3RSxNQUFNO1FBRU4sZ0RBQWdEO1FBQ2hELDRCQUE0QjtRQUM1QixpQkFBaUI7UUFDakIsc0NBQXNDO1FBQ3RDLDZCQUE2QjtRQUM3QiwyQ0FBMkM7UUFDM0Msd0JBQXdCO1FBQ3hCLG1DQUFtQztRQUNuQywrQkFBK0I7UUFDL0Isa0NBQWtDO1FBQ2xDLFNBQVM7UUFDVCxvREFBb0Q7UUFDcEQsdUNBQXVDO1FBQ3ZDLFVBQVU7UUFDVixpQ0FBaUM7UUFDakMsUUFBUTtRQUdSLElBQUk7SUFDTixDQUFDO0NBR0Y7QUFyRkQsNEJBcUZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNkayA9IHJlcXVpcmUoJ2F3cy1jZGstbGliJyk7XG5pbXBvcnQgeyBTdGFjayB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IFJlcG9zaXRvcnkgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWNyJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHsgRUNSQ2ZnIH0gZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9saWIvZWNyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgQWNjb3VudFByaW5jaXBhbCwgRWZmZWN0LCBQb2xpY3lTdGF0ZW1lbnQsIFNlcnZpY2VQcmluY2lwYWwgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcblxuXG5leHBvcnQgY2xhc3MgRUNSU3RhY2sgZXh0ZW5kcyBTdGFjayB7XG5cbiAgY29uZmlnOiBFQ1JDZmc7XG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgY29uZmlnOiBFQ1JDZmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQpO1xuXG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG5cbiAgICBmb3IgKGxldCByZXBvIG9mIHRoaXMuY29uZmlnLnJlcG9zKSB7XG5cbiAgICAgIGNvbnN0IHIgPSBuZXcgUmVwb3NpdG9yeSh0aGlzLCBgUmVwbyR7cmVwby5yZXBvc2l0b3J5TmFtZS5yZXBsYWNlKFwiLVwiLCBcIlwiKX1gLCB7XG4gICAgICAgIHJlcG9zaXRvcnlOYW1lOiByZXBvLnJlcG9zaXRvcnlOYW1lLFxuICAgICAgfSlcblxuICAgICAgci5hZGRUb1Jlc291cmNlUG9saWN5KG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgIFwiZWNyOkdldERvd25sb2FkVXJsRm9yTGF5ZXJcIixcbiAgICAgICAgICBcImVjcjpCYXRjaEdldEltYWdlXCIsXG4gICAgICAgICAgXCJlY3I6QmF0Y2hDaGVja0xheWVyQXZhaWxhYmlsaXR5XCIsXG4gICAgICAgICAgXCJlY3I6UHV0SW1hZ2VcIixcbiAgICAgICAgICBcImVjcjpJbml0aWF0ZUxheWVyVXBsb2FkXCIsXG4gICAgICAgICAgXCJlY3I6VXBsb2FkTGF5ZXJQYXJ0XCIsXG4gICAgICAgICAgXCJlY3I6Q29tcGxldGVMYXllclVwbG9hZFwiXG4gICAgICAgIF0sXG4gICAgICAgIHByaW5jaXBhbHM6IHJlcG8uYWxsb3dBY2NvdW50QWNjZXNzLm1hcChhID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV3IEFjY291bnRQcmluY2lwYWwoYSlcbiAgICAgICAgfSksXG4gICAgICAgIHNpZDogXCJBbGxvd0FjY291bnRBY2Nlc3NcIlxuICAgICAgfSkpXG5cbiAgICAgIGlmIChyZXBvLmxhbWJkYUNvbnRhaW5lcikge1xuICAgICAgICByLmFkZFRvUmVzb3VyY2VQb2xpY3kobmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgZWZmZWN0OiBFZmZlY3QuQUxMT1csXG4gICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgXCJlY3I6R2V0RG93bmxvYWRVcmxGb3JMYXllclwiLFxuICAgICAgICAgICAgXCJlY3I6QmF0Y2hHZXRJbWFnZVwiLFxuICAgICAgICAgIF0sXG4gICAgICAgICAgcHJpbmNpcGFsczogW1xuICAgICAgICAgICAgbmV3IFNlcnZpY2VQcmluY2lwYWwoJ2xhbWJkYS5hbWF6b25hd3MuY29tJyksXG4gICAgICAgICAgXSxcbiAgICAgICAgICBzaWQ6IFwiTGFtYmRhRUNSSW1hZ2VSZXRyaWV2YWxQb2xpY3lcIlxuICAgICAgICB9KSlcbiAgICAgIH1cbiAgICAgIGlmIChyZXBvLnJ1bGVzKVxuICAgICAgICByZXBvLnJ1bGVzLmZvckVhY2goKHJ1bGUpID0+IHtcbiAgICAgICAgICBpZiAocnVsZS5tYXhJbWFnZUNvdW50KSB7XG4gICAgICAgICAgICByLmFkZExpZmVjeWNsZVJ1bGUoeyB0YWdQcmVmaXhMaXN0OiBydWxlLnRhZ1ByZWZpeCwgbWF4SW1hZ2VDb3VudDogcnVsZS5tYXhJbWFnZUNvdW50IH0pXG4gICAgICAgICAgfSBlbHNlIGlmIChydWxlLm1heEFnZSkge1xuICAgICAgICAgICAgci5hZGRMaWZlY3ljbGVSdWxlKHsgdGFnUHJlZml4TGlzdDogcnVsZS50YWdQcmVmaXgsIG1heEltYWdlQWdlOiBjZGsuRHVyYXRpb24uZGF5cyhydWxlLm1heEFnZSkgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gPj5UT0RPIHRoaXMgZG9lc250IHdvcmsgLSBUaGVyZSBpcyBQUiBvcGVuIGZvciBsb29rdXAgZnVuY3Rpb24gb24gQ0RLIHJlcG9cbiAgICAvLyBBZGQgYWNjZXNzIGZvciBhbnkgZXhpc3RpbmcgcmVwb3NcbiAgICAvLyBmb3IgKGxldCByZXAgb2YgdGhpcy5jb25maWcuZXhpc3RpbmdSZXBvcykge1xuXG4gICAgLy8gICBjb25zdCByID0gUmVwb3NpdG9yeS4oXG4gICAgLy8gICAgIHRoaXMsIGBSZXBvJHtyZXAucmVwb3NpdG9yeU5hbWUucmVwbGFjZShcIi1cIiwgXCJcIil9YCwgcmVwLnJlcG9zaXRvcnlOYW1lXG4gICAgLy8gICApXG5cbiAgICAvLyAgIHIuYWRkVG9SZXNvdXJjZVBvbGljeShuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAvLyAgICAgZWZmZWN0OiBFZmZlY3QuQUxMT1csXG4gICAgLy8gICAgIGFjdGlvbnM6IFtcbiAgICAvLyAgICAgICBcImVjcjpHZXREb3dubG9hZFVybEZvckxheWVyXCIsXG4gICAgLy8gICAgICAgXCJlY3I6QmF0Y2hHZXRJbWFnZVwiLFxuICAgIC8vICAgICAgIFwiZWNyOkJhdGNoQ2hlY2tMYXllckF2YWlsYWJpbGl0eVwiLFxuICAgIC8vICAgICAgIFwiZWNyOlB1dEltYWdlXCIsXG4gICAgLy8gICAgICAgXCJlY3I6SW5pdGlhdGVMYXllclVwbG9hZFwiLFxuICAgIC8vICAgICAgIFwiZWNyOlVwbG9hZExheWVyUGFydFwiLFxuICAgIC8vICAgICAgIFwiZWNyOkNvbXBsZXRlTGF5ZXJVcGxvYWRcIlxuICAgIC8vICAgICBdLFxuICAgIC8vICAgICBwcmluY2lwYWxzOiByZXAuYWxsb3dBY2NvdW50QWNjZXNzLm1hcChhID0+IHtcbiAgICAvLyAgICAgICByZXR1cm4gbmV3IEFjY291bnRQcmluY2lwYWwoYSlcbiAgICAvLyAgICAgfSksXG4gICAgLy8gICAgIHNpZDogXCJBbGxvd0FjY291bnRBY2Nlc3NBXCJcbiAgICAvLyAgIH0pKVxuXG5cbiAgICAvLyB9XG4gIH1cblxuXG59XG5cbiJdfQ==