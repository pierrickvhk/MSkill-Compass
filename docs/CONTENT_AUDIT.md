# Content audit — Slice 7

Updated 2026-10-09 (Europe/Brussels). Scope: 30 nodes, 71 existing edges,
the six-stage Agent Builder path, five-phase mission and six Radar events.
All graph records remain **seed-review** and every relationship remains **editorial**.
The links below were reviewed as supporting context, not proof that Microsoft endorses
MSkill's teaching sequence. No new relationships or automatic verification upgrades.

## Findings and release impact

| ID | Status | Resolution / remaining acceptance |
|---|---|---|
| C1 | Corrected | All 56 placeholder rationales replaced with scoped explanations and source links. Optional use and configured permissions are explicit. e015 changed from PART_OF to RELATED_TO because tools are optional. Independent human editorial acceptance remains required. |
| C2 | Corrected | Stable `azure-ai` ID now titled Foundry Tools, retaining Azure AI Services as a search alias. The SDK documentation explicitly identifies the former name. Scope is prebuilt tools, not the whole Foundry platform. |
| C3 | Corrected | e004/e009/e014/e016 retain qualified RELATED_TO explanations; supporting reading added. |
| C4 | Clarified | Eleven REQUIRES edges remain an authored learning sequence, not vendor prerequisites. Supporting reading does not verify the sequence. Beginner usefulness testing remains pending. |
| C5 | Corrected | All 30 nodes have distinct Builder/Architect practice prompts and contextual official reading. These are original editorial exercises, not copied Microsoft instructions. |

IDs and graph size remain unchanged. Relations are not runtime guarantees: USES
means a documented configuration can use a capability, not every instance must.
The assistant-assisted revision requires a content maintainer's acceptance before
broad beta. Tenant execution of the mission is still unverified; design-only mode
and explicit self-report labels remain appropriate for invited review.

## Node-by-node review

Every node retains seed-review. Builder and Architect explanations are explicitly
labelled MSkill practice/design review. Concept links are contextual reading, not
claims that Microsoft defines the entire general discipline.

| Stable ID | Current title | Contextual reading |
|---|---|---|
| `m365-copilot` | Microsoft 365 Copilot | [Microsoft Learn](https://learn.microsoft.com/en-us/microsoftteams/copilot-ai-agents-overview) |
| `copilot-studio` | Microsoft Copilot Studio | [Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-copilot-studio/fundamentals-what-is-copilot-studio) |
| `power-automate` | Power Automate | [Microsoft Learn](https://learn.microsoft.com/en-us/power-automate/get-started-logic-flow) |
| `power-apps` | Power Apps | [Microsoft Learn](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/getting-started) |
| `dataverse` | Microsoft Dataverse | [Microsoft Learn](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/data-platform-intro) |
| `sharepoint` | SharePoint | [Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio) |
| `microsoft-graph` | Microsoft Graph | [Microsoft Learn](https://learn.microsoft.com/en-us/graph/overview) |
| `entra-id` | Microsoft Entra ID | [Microsoft Learn](https://learn.microsoft.com/en-us/entra/fundamentals/what-is-entra) |
| `azure-functions` | Azure Functions | [Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-http-webhook) |
| `azure-ai` | Foundry Tools | [Microsoft Learn](https://learn.microsoft.com/en-us/azure/foundry/how-to/develop/sdk-overview) |
| `power-platform-admin` | Power Platform admin center | [Microsoft Learn](https://learn.microsoft.com/en-us/power-platform/admin/security) |
| `teams` | Microsoft Teams | [Microsoft Learn](https://learn.microsoft.com/en-us/microsoftteams/copilot-ai-agents-overview) |
| `fundamentals-ai` | AI fundamentals | [Microsoft Learn](https://learn.microsoft.com/en-us/training/modules/fundamentals-generative-ai/) |
| `generative-ai` | Generative AI | [Microsoft Learn](https://learn.microsoft.com/en-us/training/modules/fundamentals-generative-ai/) |
| `prompts` | Prompt design | [Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-instructions) |
| `agents` | AI agents | [Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-copilot-studio/fundamentals-what-is-copilot-studio) |
| `knowledge-sources` | Knowledge sources | [Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio) |
| `retrieval-grounding` | Retrieval and grounding | [Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio) |
| `actions-tools` | Agent actions and tools | [Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-connectors) |
| `connectors` | Connectors | [Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-connectors) |
| `cloud-flows` | Cloud flows | [Microsoft Learn](https://learn.microsoft.com/en-us/power-automate/get-started-logic-flow) |
| `business-processes` | Business process mapping | [Microsoft Learn](https://learn.microsoft.com/en-us/power-automate/get-started-logic-flow) |
| `app-ui` | App user experience | [Microsoft Learn](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/getting-started) |
| `data-modeling` | Data modeling | [Microsoft Learn](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/data-platform-intro) |
| `access-control` | Access control | [Microsoft Learn](https://learn.microsoft.com/en-us/entra/fundamentals/what-is-entra) |
| `governance` | Governance | [Microsoft Learn](https://learn.microsoft.com/en-us/power-platform/admin/security) |
| `alm` | Application lifecycle management | [Microsoft Learn](https://learn.microsoft.com/en-us/power-platform/alm/overview-alm) |
| `monitoring-evals` | Monitoring and evaluation | [Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-test-bot) |
| `api-basics` | API fundamentals | [Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-http-webhook) |
| `solutions-deployment` | Solution deployment | [Microsoft Learn](https://learn.microsoft.com/en-us/power-platform/alm/overview-alm) |

## Relationship-by-relationship review

All sources are supporting reading. No verified timestamps were added.

| ID | Directed relationship | Scoped editorial explanation / source |
|---|---|---|
| e001 | `generative-ai` → REQUIRES → `fundamentals-ai` | MSkill suggested learning order: study AI fundamentals before Generative AI. This is editorial sequencing, not a universal technical requirement or a Microsoft prerequisite. [Reading](https://learn.microsoft.com/en-us/training/modules/fundamentals-generative-ai/) |
| e002 | `prompts` → REQUIRES → `generative-ai` | MSkill suggested learning order: study Generative AI before Prompt design. This is editorial sequencing, not a universal technical requirement or a Microsoft prerequisite. [Reading](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-instructions) |
| e003 | `agents` → REQUIRES → `generative-ai` | MSkill suggested learning order: study Generative AI before AI agents. This is editorial sequencing, not a universal technical requirement or a Microsoft prerequisite. [Reading](https://learn.microsoft.com/en-us/training/modules/fundamentals-generative-ai/) |
| e004 | `knowledge-sources` → RELATED_TO → `data-modeling` | MSkill editorial connection: data modeling helps organize structured knowledge. It is not a universal prerequisite for adding a document as an agent knowledge source. [Reading](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio) |
| e005 | `retrieval-grounding` → REQUIRES → `knowledge-sources` | MSkill suggested learning order: study Knowledge sources before Retrieval and grounding. This is editorial sequencing, not a universal technical requirement or a Microsoft prerequisite. [Reading](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio) |
| e006 | `actions-tools` → REQUIRES → `api-basics` | MSkill suggested learning order: study API fundamentals before Agent actions and tools. This is editorial sequencing, not a universal technical requirement or a Microsoft prerequisite. [Reading](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-connectors) |
| e007 | `cloud-flows` → REQUIRES → `business-processes` | MSkill suggested learning order: study Business process mapping before Cloud flows. This is editorial sequencing, not a universal technical requirement or a Microsoft prerequisite. [Reading](https://learn.microsoft.com/en-us/power-automate/get-started-logic-flow) |
| e008 | `app-ui` → REQUIRES → `business-processes` | MSkill suggested learning order: study Business process mapping before App user experience. This is editorial sequencing, not a universal technical requirement or a Microsoft prerequisite. [Reading](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/getting-started) |
| e009 | `access-control` → RELATED_TO → `entra-id` | MSkill editorial connection: Microsoft Entra ID is an identity platform relevant to access control. The general access-control concept does not require this specific product. [Reading](https://learn.microsoft.com/en-us/entra/fundamentals/what-is-entra) |
| e010 | `monitoring-evals` → REQUIRES → `governance` | MSkill suggested learning order: study Governance before Monitoring and evaluation. This is editorial sequencing, not a universal technical requirement or a Microsoft prerequisite. [Reading](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-test-bot) |
| e011 | `solutions-deployment` → REQUIRES → `alm` | MSkill suggested learning order: study Application lifecycle management before Solution deployment. This is editorial sequencing, not a universal technical requirement or a Microsoft prerequisite. [Reading](https://learn.microsoft.com/en-us/power-platform/alm/overview-alm) |
| e012 | `agents` → REQUIRES → `prompts` | MSkill suggested learning order: study Prompt design before AI agents. This is editorial sequencing, not a universal technical requirement or a Microsoft prerequisite. [Reading](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-instructions) |
| e013 | `cloud-flows` → PART_OF → `power-automate` | Cloud flows are a Power Automate workflow category; this hierarchy does not make every automation a cloud flow. [Reading](https://learn.microsoft.com/en-us/power-automate/get-started-logic-flow) |
| e014 | `app-ui` → RELATED_TO → `power-apps` | MSkill editorial connection: app user experience is a design concern when building Power Apps; the general skill is not a component owned by Power Apps. [Reading](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/getting-started) |
| e015 | `actions-tools` → RELATED_TO → `agents` | Configured tools can extend an agent with service operations. Tools are optional; an agent does not inherently have every available action. [Reading](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-connectors) |
| e016 | `knowledge-sources` → RELATED_TO → `agents` | MSkill editorial connection: an agent may consult knowledge sources. Those sources can exist independently of the agent and are not necessarily part of it. [Reading](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio) |
| e017 | `m365-copilot` → RELATED_TO → `generative-ai` | MSkill connects Microsoft 365 Copilot with generative AI to explain generated assistance in work contexts; availability depends on the licensed experience. [Reading](https://learn.microsoft.com/en-us/microsoftteams/copilot-ai-agents-overview) |
| e018 | `copilot-studio` → ENABLES → `agents` | Copilot Studio provides an environment for authoring agents. Publishing and available features depend on the selected experience and tenant requirements. [Reading](https://learn.microsoft.com/en-us/microsoft-copilot-studio/fundamentals-what-is-copilot-studio) |
| e019 | `power-automate` → ENABLES → `cloud-flows` | Power Automate supports building cloud flows around triggers and actions; the specific services used determine connection requirements. [Reading](https://learn.microsoft.com/en-us/power-automate/get-started-logic-flow) |
| e020 | `power-apps` → ENABLES → `app-ui` | Canvas apps provide controls and layouts for application interfaces. MSkill treats interface design as a broader skill than using this product. [Reading](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/getting-started) |
| e021 | `dataverse` → ENABLES → `data-modeling` | Dataverse supports tables and relationships for business data models. Choosing an appropriate model remains a design task. [Reading](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/data-platform-intro) |
| e022 | `connectors` → ENABLES → `cloud-flows` | Connectors expose service operations for automation. Individual operations still require their configured connections and permissions. [Reading](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-connectors) |
| e023 | `knowledge-sources` → ENABLES → `retrieval-grounding` | Knowledge sources supply material for retrieval-based grounding; their presence alone does not guarantee relevant or correct answers. [Reading](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio) |
| e024 | `entra-id` → ENABLES → `access-control` | Entra ID supports identity and access management. MSkill distinguishes that implementation from the broader access-control discipline. [Reading](https://learn.microsoft.com/en-us/entra/fundamentals/what-is-entra) |
| e025 | `business-processes` → ENABLES → `cloud-flows` | MSkill recommends describing a process trigger, desired result and exceptions before automating it. This is planning advice, not a product prerequisite. [Reading](https://learn.microsoft.com/en-us/power-automate/get-started-logic-flow) |
| e026 | `api-basics` → ENABLES → `actions-tools` | Understanding API inputs, outputs and errors helps when designing custom tools. Using a prebuilt tool need not require writing an API. [Reading](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-connectors) |
| e027 | `generative-ai` → ENABLES → `agents` | Generative AI can support agents that interpret requests and produce responses. This relationship does not imply every agent uses a generative model. [Reading](https://learn.microsoft.com/en-us/training/modules/fundamentals-generative-ai/) |
| e028 | `copilot-studio` → INTEGRATES_WITH → `power-automate` | Copilot Studio and Power Automate have connected flow authoring scenarios. Check the documented flow type, environment and billing requirements before reuse. [Reading](https://learn.microsoft.com/en-us/microsoft-copilot-studio/flows-overview) |
| e029 | `copilot-studio` → INTEGRATES_WITH → `sharepoint` | Copilot Studio supports SharePoint knowledge sources. Access depends on the source configuration and authentication; connecting a site is not blanket permission. [Reading](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio) |
| e030 | `copilot-studio` → INTEGRATES_WITH → `dataverse` | Copilot Studio can use Dataverse tables as knowledge with the documented search, authentication and permission setup. [Reading](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/knowledge-add-dataverse-tables) |
| e031 | `power-apps` → INTEGRATES_WITH → `power-automate` | A canvas app control can trigger a Power Automate flow. App and flow connections must be configured for the intended users. [Reading](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/how-to/trigger-flow) |
| e032 | `power-apps` → INTEGRATES_WITH → `dataverse` | Power Apps can build on Dataverse tables. This is a supported data option, not a requirement for every canvas app. [Reading](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/data-platform-intro) |
| e033 | `power-automate` → INTEGRATES_WITH → `teams` | A Power Automate flow can use a Teams connector action, such as posting a message, through an authorized connection. [Reading](https://learn.microsoft.com/en-us/sharepoint/dev/business-apps/power-automate/get-started/connect-to-other-services-in-your-flow) |
| e034 | `power-automate` → INTEGRATES_WITH → `sharepoint` | The SharePoint connector provides list and library triggers and actions for Power Automate flows. [Reading](https://learn.microsoft.com/en-us/sharepoint/dev/business-apps/power-automate/sharepoint-connector-actions-triggers) |
| e035 | `power-automate` → INTEGRATES_WITH → `dataverse` | The Dataverse connector exposes data operations and triggers to Power Automate; the chosen connection must have the required access. [Reading](https://learn.microsoft.com/en-us/power-automate/dataverse/overview) |
| e036 | `azure-functions` → INTEGRATES_WITH → `power-automate` | Custom server-side logic, including Azure Functions, can be exposed to Power Automate through an API connector. This requires deliberate API and authentication configuration. [Reading](https://learn.microsoft.com/en-us/power-automate/developer/dev-enterprise-intro) |
| e037 | `microsoft-graph` → INTEGRATES_WITH → `teams` | Microsoft Graph exposes supported Teams APIs. An application must request the permissions required by each operation. [Reading](https://learn.microsoft.com/en-us/graph/overview) |
| e038 | `microsoft-graph` → INTEGRATES_WITH → `sharepoint` | Microsoft Graph exposes supported SharePoint APIs. The available operation and granted permissions determine which content an application can access. [Reading](https://learn.microsoft.com/en-us/graph/overview) |
| e039 | `m365-copilot` → RELATED_TO → `copilot-studio` | MSkill links the Microsoft 365 assistance experience with Copilot Studio agent authoring. These are distinct products; licensing and deployment choices must be checked separately. [Reading](https://learn.microsoft.com/en-us/microsoft-copilot-studio/fundamentals-what-is-copilot-studio) |
| e040 | `copilot-studio` → USES → `knowledge-sources` | Copilot Studio agents can be configured with knowledge sources. Source selection is optional and should match the intended questions. [Reading](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio) |
| e041 | `copilot-studio` → USES → `actions-tools` | Copilot Studio agents can call configured tools. Tool availability and authorization must be established before an agent can use them. [Reading](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-connectors) |
| e042 | `copilot-studio` → USES → `connectors` | Copilot Studio can use Power Platform connectors to expose service operations as tools; a connector is not an automatic grant of access. [Reading](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-connectors) |
| e043 | `power-automate` → USES → `connectors` | Cloud flows can use connector triggers and actions. A flow does not automatically use every connector or service. [Reading](https://learn.microsoft.com/en-us/power-automate/get-started-logic-flow) |
| e044 | `power-apps` → USES → `dataverse` | Dataverse is used by model-driven apps and can supply data to canvas apps. Canvas apps can also use other data sources. [Reading](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/data-platform-intro) |
| e045 | `agents` → USES → `retrieval-grounding` | Knowledge-grounded agents can retrieve source material to inform responses. Retrieval is one design pattern, not a requirement for every agent. [Reading](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio) |
| e046 | `azure-functions` → USES → `api-basics` | HTTP-triggered Azure Functions receive requests and return responses. API design knowledge is relevant to that pattern; other trigger types exist. [Reading](https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-http-webhook) |
| e047 | `copilot-studio` → GOVERNED_BY → `governance` | Power Platform data policies can restrict Copilot Studio capabilities and connections. Effective controls depend on the applicable tenant and environment policies. [Reading](https://learn.microsoft.com/en-us/microsoft-copilot-studio/admin-data-loss-prevention) |
| e048 | `power-automate` → GOVERNED_BY → `governance` | MSkill recommends reviewing Power Automate environment access and data policies before sharing automations. [Reading](https://learn.microsoft.com/en-us/power-platform/admin/security) |
| e049 | `power-apps` → GOVERNED_BY → `governance` | MSkill recommends reviewing Power Apps sharing, environment access and data policies before making an app available to others. [Reading](https://learn.microsoft.com/en-us/power-platform/admin/security) |
| e050 | `agents` → GOVERNED_BY → `access-control` | MSkill treats authentication and allowed tool access as agent design decisions. Instructions alone are not an authorization boundary. [Reading](https://learn.microsoft.com/en-us/microsoft-copilot-studio/admin-data-loss-prevention) |
| e051 | `knowledge-sources` → GOVERNED_BY → `access-control` | Access behavior differs between knowledge-source types. Review each source configuration; do not assume uploaded content inherits per-user source permissions. [Reading](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio) |
| e052 | `dataverse` → GOVERNED_BY → `access-control` | Dataverse provides security controls for data access. Review the effective roles and permissions for the intended users. [Reading](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/data-platform-intro) |
| e053 | `power-platform-admin` → ENABLES → `governance` | Power Platform administration provides controls for environments, users and policies; governance also requires organizational decisions and ownership. [Reading](https://learn.microsoft.com/en-us/power-platform/admin/security) |
| e054 | `solutions-deployment` → RELATED_TO → `power-platform-admin` | Solution deployment involves target environments and administrative permissions. MSkill links this practice to Power Platform administration. [Reading](https://learn.microsoft.com/en-us/power-platform/alm/overview-alm) |
| e055 | `alm` → RELATED_TO → `power-platform-admin` | MSkill connects lifecycle management with environment administration when planning release ownership and operational support. [Reading](https://learn.microsoft.com/en-us/power-platform/alm/overview-alm) |
| e056 | `alm` → RELATED_TO → `solutions-deployment` | Power Platform solutions package components for movement between environments as part of a managed lifecycle. [Reading](https://learn.microsoft.com/en-us/power-platform/alm/overview-alm) |
| e057 | `monitoring-evals` → RELATED_TO → `agents` | MSkill recommends testing agent conversations and inspecting behavior before release. Design-time testing does not prove production-channel behavior. [Reading](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-test-bot) |
| e058 | `microsoft-graph` → REQUIRES → `api-basics` | MSkill suggested learning order: study API fundamentals before Microsoft Graph. This is editorial sequencing, not a universal technical requirement or a Microsoft prerequisite. [Reading](https://learn.microsoft.com/en-us/graph/overview) |
| e059 | `azure-functions` → RELATED_TO → `api-basics` | HTTP-triggered functions are a practical setting for learning request and response contracts; this is an editorial learning connection. [Reading](https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-http-webhook) |
| e060 | `azure-ai` → RELATED_TO → `agents` | MSkill connects prebuilt Foundry Tools with agent solution design as an optional capability choice, not a required agent platform. [Reading](https://learn.microsoft.com/en-us/azure/foundry/how-to/develop/sdk-overview) |
| e061 | `azure-ai` → RELATED_TO → `generative-ai` | Foundry Tools and generative-model APIs are distinct capability families. MSkill links them for comparison when choosing an AI solution approach. [Reading](https://learn.microsoft.com/en-us/azure/foundry/how-to/develop/sdk-overview) |
| e062 | `dataverse` → RELATED_TO → `data-modeling` | MSkill uses Dataverse tables and relationships as one concrete setting for practicing data modeling. [Reading](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/data-platform-intro) |
| e063 | `sharepoint` → RELATED_TO → `knowledge-sources` | SharePoint is a supported source option for Copilot Studio knowledge. Relevance and access must be reviewed for the selected site content. [Reading](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio) |
| e064 | `teams` → RELATED_TO → `m365-copilot` | Teams offers Copilot experiences in collaboration workflows; exact availability depends on licensing and administrator configuration. [Reading](https://learn.microsoft.com/en-us/microsoftteams/copilot-ai-agents-overview) |
| e065 | `solutions-deployment` → GOVERNED_BY → `governance` | MSkill recommends reviewed deployment, ownership and rollback decisions as part of release governance. [Reading](https://learn.microsoft.com/en-us/power-platform/alm/overview-alm) |
| e066 | `alm` → GOVERNED_BY → `governance` | Application lifecycle management includes governance across development, deployment and maintenance; it is broader than packaging a release. [Reading](https://learn.microsoft.com/en-us/power-platform/alm/overview-alm) |
| e067 | `copilot-studio` → RELATED_TO → `monitoring-evals` | Copilot Studio provides conversation testing and activity inspection. MSkill recommends recording expected and observed outcomes separately. [Reading](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-test-bot) |
| e068 | `power-apps` → RELATED_TO → `app-ui` | MSkill links Power Apps to interface design practice: clear controls, readable layouts and useful feedback still require deliberate design. [Reading](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/getting-started) |
| e069 | `business-processes` → RELATED_TO → `power-automate` | A business process supplies context for choosing what a flow should automate. The relationship is editorial planning guidance. [Reading](https://learn.microsoft.com/en-us/power-automate/get-started-logic-flow) |
| e070 | `governance` → RELATED_TO → `access-control` | MSkill treats access decisions as one part of governance, alongside ownership and operational policy. [Reading](https://learn.microsoft.com/en-us/power-platform/admin/security) |
| e071 | `cloud-flows` → RELATED_TO → `actions-tools` | Agent flows can perform multi-step operations for an agent. Check the supported flow pattern before treating an existing cloud flow as an agent tool. [Reading](https://learn.microsoft.com/en-us/microsoft-copilot-studio/flows-overview) |

## First-journey source review

The path and mission retain their original source-specific review timestamps from
Slice 4/5. Slice 7 re-opened [Copilot Studio documentation](https://learn.microsoft.com/en-us/microsoft-copilot-studio/)
and [uploaded knowledge](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-add-file-upload):
the latter describes document upload, Dataverse search and policy requirements,
not a universal requirement to learn formal data modeling. This supports narrowing
e004, but does not verify every knowledge-source configuration.
[Entra identity documentation](https://learn.microsoft.com/en-us/entra/identity/)
identifies a Microsoft identity platform; access control remains a broader concept.
The changes to e009/e014/e016 are editorial scope corrections, not Microsoft claims.

The first path is an authored sequence, not an official Microsoft curriculum.
Mission outcomes are self-reported; expected test outcomes are teaching guidance,
not executed test results. Design-only mode remains available without tenant access.
No claims of tenant execution, certification, free publishing or licensing eligibility
were newly verified. A hands-on Microsoft tenant walkthrough remains a content
acceptance item; do not equate passing app tests with validating those instructions.

## Radar re-review

All six official pages opened; titles, UTC schedules, livestream format and visible
topics matched. No cancellation notice observed; “Cancel registration” is not an
event cancellation. Browsing may serve cached listings, so this is a review of the
retrieved official pages, not a guarantee of live availability. Catalog timestamps
updated to `2026-10-08T22:31:59Z`. Original timezone UTC; display converts by IANA zone.
Graph links are editorial topic mappings, never Microsoft-endorsed recommendations.

| Event | UTC date / time | State at review | Topic mapping reviewed |
|---|---|---|---|
| [Composing Knowledge Bases That Reason Over Work, Business, and the Web](https://reactor.microsoft.com/en-us/reactor/events/27452/) | 2026-10-01T16:00:00Z – 2026-10-01T17:00:00Z | Past | knowledge-sources, retrieval-grounding, agents |
| [Agents That Take Action: Secure Enterprise Integration with Azure](https://reactor.microsoft.com/en-us/reactor/events/27509/) | 2026-10-13T15:00:00Z – 2026-10-13T16:00:00Z | Upcoming | agents, actions-tools, azure-functions, entra-id, access-control |
| [The Agentic SDLC: Making Application Modernization Continuous](https://reactor.microsoft.com/en-us/reactor/events/27622/) | 2026-10-13T17:00:00Z – 2026-10-13T18:00:00Z | Upcoming | agents, alm |
| [Production-Grade Agents: Evaluation, Tracing, Security, and Operations](https://reactor.microsoft.com/en-us/reactor/events/27510/) | 2026-10-15T15:00:00Z – 2026-10-15T16:00:00Z | Upcoming | agents, monitoring-evals, governance, alm |
| [Grounding Agents in Business Context with Fabric IQ](https://reactor.microsoft.com/en-us/reactor/events/27455/) | 2026-10-15T16:00:00Z – 2026-10-15T17:00:00Z | Upcoming | agents, knowledge-sources, retrieval-grounding |
| [Model Mondays - Spotlight on NVIDIA models](https://reactor.microsoft.com/en-us/reactor/events/27577/) | 2026-11-02T18:30:00Z – 2026-11-02T19:30:00Z | Upcoming | agents, generative-ai, monitoring-evals |

See [Radar maintenance](RADAR.md) for weekly and near-event review. No replacement events invented.
