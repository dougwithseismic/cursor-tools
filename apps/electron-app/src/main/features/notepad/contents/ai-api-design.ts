export const aiApiDesign = {
  name: 'AI: API Design',
  text: `Help me design a RESTful/GraphQL API endpoint or service.

  Required Information:
  - Purpose and functionality
  - Data models and relationships
  - Authentication requirements
  - Expected request/response formats
  - Performance requirements
  - Security considerations
  - Error handling needs

  Design Considerations:
  - RESTful principles or GraphQL schema
  - Input validation
  - Rate limiting
  - Caching strategy
  - Documentation (OpenAPI/Swagger)
  - Versioning approach
  - Monitoring and logging
  - Request/Response Object (RO-RO) pattern implementation
  - Logical endpoint grouping and resource hierarchy

  Diagram Requirements:
  - Mermaid sequence diagram for request flow
  - Mermaid entity relationship diagram for data models
  - Mermaid flowchart for authentication flow
  - Component interaction diagrams

  Resource Grouping:
  - Group related endpoints by domain/feature
  - Define clear resource boundaries
  - Plan sub-resource relationships
  - Consider bulk operations
  - Establish consistent naming conventions

  Example Request:
  "Design an API endpoint for user management:
  - CRUD operations using RO-RO pattern
  - Role-based access control
  - Email verification flow
  - Password reset functionality
  - Session management
  - Rate limiting per client
  - Include sequence diagram for auth flow
  - Group endpoints logically by feature"

  Bad Examples:
  "make an API"
  "need endpoint for users"
  "create some routes"
  "just draw some boxes"`
}
