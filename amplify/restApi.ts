import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  LambdaIntegration,
  RestApi,
  IResource,
} from "aws-cdk-lib/aws-apigateway";
import { Backend } from "@aws-amplify/backend";
import type { IFunction } from "aws-cdk-lib/aws-lambda";

// Collects all endpoint ARNs for policy
export const apiEndpointArns: string[] = [];

// Helper types for endpoint setup
interface ApiEndpointConfig {
  parentResource: IResource;
  path: string;
  lambda: IFunction;
  methods: string[];
  authorizer?: CognitoUserPoolsAuthorizer;
  authorizationType?: AuthorizationType;
  hubRestApi: RestApi;
}

/**
 * Adds a resource and attaches Lambda integration and methods with optional Cognito auth.
 * Also tracks the endpoint ARN for policy inclusion.
 */
function addApiResourceWithMethods({
  parentResource,
  path,
  lambda,
  methods,
  authorizer,
  authorizationType = AuthorizationType.NONE,
  hubRestApi,
}: ApiEndpointConfig) {
  const resource = parentResource.addResource(path, authorizer
    ? {
        defaultMethodOptions: {
          authorizationType,
          authorizer,
        },
      }
    : undefined);
  const integration = new LambdaIntegration(lambda);
  methods.forEach((method) => {
    resource.addMethod(method, integration);
  });
  // Track ARN for all methods on this resource
  apiEndpointArns.push(
    `${hubRestApi.arnForExecuteApi('*', `/api/${path}`)}`
  );
  return resource;
}

/**
 * Sets up all API endpoints and returns outputs for backend.addOutput.
 * Add new endpoints here as needed.
 */
export function setupApiResources({
  apiPath,
  hubRestApi,
  cognitoAuth,
  backend,
}: {
  apiPath: IResource;
  hubRestApi: RestApi;
  cognitoAuth: CognitoUserPoolsAuthorizer;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  backend: Backend<any>; 
}) {
  /**
   * 
   *   ██████╗ ███████╗███████╗████████╗     █████╗ ██████╗ ██╗
   *   ██╔══██╗██╔════╝██╔════╝╚══██╔══╝    ██╔══██╗██╔══██╗██║
   *   ██████╔╝█████╗  ███████╗   ██║       ███████║██████╔╝██║
   *   ██╔══██╗██╔══╝  ╚════██║   ██║       ██╔══██║██╔═══╝ ██║
   *   ██║  ██║███████╗███████║   ██║       ██║  ██║██║     ██║
   *   ╚═╝  ╚═╝╚══════╝╚══════╝   ╚═╝       ╚═╝  ╚═╝╚═╝     ╚═╝                                                        
   *
   *   REST API ENDPOINTS DEFINITION ZONE
   *   ----------------------------------
   *   Add new REST API endpoint handlers below!
   *
   *   Example:
   *   const myPath = addApiResourceWithMethods({ ... });
   *
   *   🚦 Place new endpoints here to keep your API organized! 🚦
   */

  const paymentPath = addApiResourceWithMethods({
    parentResource: apiPath,
    path: "payment",
    lambda: backend.apiPaymentFunction.resources.lambda,
    methods: ["GET", "POST", "DELETE", "PUT"],
    authorizer: cognitoAuth,
    authorizationType: AuthorizationType.COGNITO,
    hubRestApi,
  });

  // Return any outputs you want to expose
  return {
    paymentPath: paymentPath.path,
  };
}
