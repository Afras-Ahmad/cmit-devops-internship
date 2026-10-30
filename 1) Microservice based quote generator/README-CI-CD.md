# Container CI/CD for the Quote Generator

## Pipeline

A GitHub Actions workflow at `.github/workflows/container-ci-cd.yml` runs on pushes and pull requests targeting `main` when this project directory changes.

1. Python static checks and quote-data unit test.
2. API Gateway Node test and syntax check.
3. Frontend Node smoke test and production webpack build.
4. Build three Docker images with BuildKit.
5. Scan each image with Trivy; HIGH/CRITICAL findings fail the pipeline (unfixed findings are ignored).
6. On a push to `main` only, assume an AWS role with GitHub OIDC and publish the exact scanned image artifacts to ECR using the commit SHA as an immutable tag.

The workflow does not deploy containers to ECS/EKS. It publishes versioned images to ECR.

## AWS setup

1. Create (or reuse) the IAM OIDC provider for `https://token.actions.githubusercontent.com` with audience `sts.amazonaws.com`.
2. Deploy `infra/ecr-oidc.yml` in the target AWS account, passing the existing OIDC provider ARN and GitHub repository details.
3. Add GitHub repository Actions variables:
   - `AWS_REGION`: AWS region containing the ECR repositories.
   - `AWS_ROLE_ARN`: CloudFormation output `RoleArn`.
4. Ensure Actions are enabled for the repository. No AWS access keys or long-lived credentials are stored in GitHub.

The IAM trust policy restricts role assumption to this repository's `main` branch. The role can push only to the three project ECR repositories.

## Image locations

- `quote-service`
- `api-gateway`
- `frontend`

Images are tagged with the full Git commit SHA. Tags are immutable.

## Local checks

Run Python checks from `QuoteService` with `python -m pytest -q`. Run API Gateway tests from `ApiGateway` with `yarn test`. Run frontend tests and build from `FrontendApplication` with `npm test` and `npm run build` (set `API_GATEWAY` for the webpack EnvironmentPlugin).

## Security and limitations

- OIDC is used instead of static AWS credentials.
- Containers run as non-root where supported by the existing runtime images.
- Trivy scans occur before ECR publication; an image that fails scanning is not pushed.
- Pin GitHub Actions to reviewed full commit SHAs before treating this as a hardened production supply-chain pipeline.
- The current frontend is an older Webpack 4 application and uses `NODE_OPTIONS=--openssl-legacy-provider`; schedule a Webpack 5 migration.
- Review Trivy findings and validate the workflow in the target AWS account before production release.
