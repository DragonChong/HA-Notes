# Best Practices for API Documentation

### 1. Use OpenAPI annotations (you already have the dependency)

Since you have `springdoc-openapi-starter-webmvc-ui` version 2.6.0, use OpenAPI 3 annotations to generate interactive documentation.

#### Controller-level documentation

```java
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(
    name = "Data Source Operations",
    description = "APIs for managing data source configurations and testing distributed transactions"
)
@RestController
@RequestMapping(value = "/api")
@Validated
public class DataSourceController {
    
    @Operation(
        summary = "Update LoeControl value",
        description = "Updates the LoeControl value by hospital and name. This operation affects Oracle database."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully updated",
            content = @Content(schema = @Schema(implementation = ResultDataResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid input parameters"
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error"
        )
    })
    @PostMapping("/updateLoeControlValue")
    public ResultDataResponse<Integer> updateLoeControlValue(
        @RequestBody @Valid UpdateLoeControlDto dto
    ) {
        // implementation
    }
}
```

#### DTO-level documentation

```java
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
    description = "DTO for testing distributed transaction across Oracle and PostgreSQL/Sybase"
)
@Data
@NoArgsConstructor
public class TestDistributedTransactionDto {

    @Schema(
        description = "Service parameters for database routing",
        required = true,
        example = "{\"serverName\": \"NDH\", \"database\": \"LIS\"}"
    )
    @NotNull(message = "serviceParameterVo cannot be null!")
    private ServiceParameterVo serviceParameterVo;

    @Schema(
        description = "Flag to simulate exception after Oracle update to test rollback",
        example = "false",
        defaultValue = "false"
    )
    private Boolean simulateException = false;
}
```

### 2. Configuration for OpenAPI

Add OpenAPI configuration:

```java
package hk.org.ha.lis.patient.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("LIS Patient Service API")
                .version("1.0.4")
                .description("REST APIs for Laboratory Information System (LIS) patient management operations")
                .contact(new Contact()
                    .name("LIS Team")
                    .email("lis-team@example.com"))
                .license(new License()
                    .name("Internal Use Only")))
            .servers(List.of(
                new Server().url("http://localhost:8080").description("Local Development"),
                new Server().url("https://dev.example.com").description("Development Environment"),
                new Server().url("https://sit.example.com").description("SIT Environment")
            ));
    }
}
```

### 3. Best practices summary

#### Do's:

- Use `@Operation` for endpoint descriptions
- Use `@Schema` on DTOs and model classes
- Document all response codes with `@ApiResponses`
- Provide examples in `@Schema` annotations
- Use `@Tag` to group related endpoints
- Document required vs optional parameters
- Include business logic context in descriptions
- Keep JavaDoc comments alongside OpenAPI annotations

#### Don'ts:

- Don't rely solely on JavaDoc (use OpenAPI annotations)
- Don't skip error response documentation
- Don't use generic descriptions
- Don't forget to document nested objects
- Don't expose sensitive information in examples

### 4. Additional recommendations

#### Response standardization

Document your standard response wrapper:2

```java
@Schema(description = "Standard API response wrapper")
public class ResultDataResponse<T> {
    @Schema(description = "Response status code", example = "200")
    private int code;
    
    @Schema(description = "Response message", example = "Success")
    private String message;
    
    @Schema(description = "Response data payload")
    private T data;
}
```

#### Parameter documentation

For path/query parameters:

```java
@Operation(summary = "Get patient by ID")
@GetMapping("/patients/{id}")
public ResultDataResponse<Patient> getPatient(
    @Parameter(
        description = "Patient identifier",
        required = true,
        example = "12345"
    )
    @PathVariable String id
) {
    // implementation
}
```

### 5. Accessing the documentation

Once configured, access:

- Swagger UI: `http://localhost:8080/swagger-ui.html` or `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- OpenAPI YAML: `http://localhost:8080/v3/api-docs.yaml`

### 6. Integration with CI/CD

Consider:

- Generating OpenAPI spec during build
- Publishing to API documentation portals
- Validating API contracts in tests
- Versioning your API documentation