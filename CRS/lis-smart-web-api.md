# lis-smart-web-api

# Relationship Between Files and OpenShift Configuration

## Overview of the Files

The three files you've shared are part of a deployment setup for a Spring Boot application on OpenShift. Here's how they relate to each other:

### 1. deploy/GLOBAL/deploy/config/deploy-template.yaml

This is an OpenShift template file that defines the Kubernetes resources needed for your application:

- Deployment
- Service
- HorizontalPodAutoscaler
- ConfigMap

It uses parameters (denoted by ${PARAMETER_NAME}) that will be substituted with actual values during deployment.

### 2. deploy/GLOBAL/deploy/config/deploy-corp.properties

This properties file contains the values for the parameters defined in the template. For example:

LOE_DB_URL="!!LIS/##env##/JDBC/LOE_DB/LOE_DB_URL!!"

The !!LIS/##env##/...!! syntax appears to be placeholders that will be substituted with actual values from an external secrets or configuration management system during the deployment process. The ##env## likely gets replaced with the target environment (dev, test, prod, etc.).

### 3. src/main/resources/application.properties

This is the Spring Boot application configuration file that defines how your application should behave. It references environment variables (using ${VAR_NAME} syntax) that will be provided by the container environment when running in OpenShift.

## Database URL Configuration Flow

For the specific case of LOE_DB_URL, the flow works like this:

- Template Definition: The OpenShift template (deploy-template.yaml) defines that the container should have an environment variable named LOE_DB_URL:
    - name: LOE_DB_URL

    value: ${LOE_DB_URL}

- Parameter Value: The template defines a parameter that will be used to set this value:

    parameters:

    - name: LOE_DB_URL

    description: LOE_DB_URL

    required: true

- Provided Value: During deployment, the LOE_DB_URL parameter is given a value from deploy-corp.properties:

    LOE_DB_URL="!!LIS/##env##/JDBC/LOE_DB/LOE_DB_URL!!"

    This placeholder will be replaced with an actual database URL from your organization's configuration system.

- Runtime Usage: When the container runs, Spring Boot reads the environment variable and uses it to configure the database connection:

    spring.datasource.url=${LOE_DB_URL}

## Important Note on ConfigMaps

In the template you provided, LOE_DB_URL is not actually read from a ConfigMap. It's set directly as an environment variable in the container. The only ConfigMap defined in the template ({deploy:appname}-als-config-{deploy:appversion}) is used for application logging configuration, not database connection details.

For sensitive information like database credentials, using environment variables populated from external secrets management (as your setup appears to do) is a common practice. If you wanted to use ConfigMaps instead, you would need to:

- Define a ConfigMap with your database settings
- Reference the ConfigMap in your Deployment using either:
- envFrom.configMapRef to import all values
- Individual valueFrom.configMapKeyRef entries for specific values

However, for sensitive information like database credentials, Kubernetes Secrets would be more appropriate than ConfigMaps.