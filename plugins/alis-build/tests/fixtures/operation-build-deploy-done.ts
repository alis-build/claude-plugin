// A real build-and-deploy of alis.os.console.v2 (2.44.19 to Development), as
// `alis operations describe <op> --json --verbose` printed it once done, with
// the Spanner type list cut to two rows. A finished response drops the docker steps.
export const BUILD_DEPLOY_DONE = {
  "buildLogsUri": "https://build.alis.alis.dev/executions/a968e5d1-f9c7-4b1c-a698-835b152a998c",
  "deployments": [
    {
      "error": null,
      "logsUri": "https://deploy.alis.alis.dev/executions/dc7b2964-2e5a-48fb-b210-7b4e66f4f569",
      "name": "organisations/alis/products/os/environments/1y2ozvryhc9kk/deployments/console-v2",
      "progress": {
        "actionGroupId": "alis-os-dev-m27",
        "buildSteps": [],
        "changeSummary": {
          "add": 0,
          "change": 1,
          "ignore": 0,
          "import": 0,
          "operation": "apply",
          "remove": 0
        },
        "diagnostics": [],
        "endTime": "2026-10-08T21:27:02.549500471Z",
        "execution": "executions/dc7b2964-2e5a-48fb-b210-7b4e66f4f569",
        "failed": false,
        "failure": null,
        "outputs": [],
        "protoSyncs": [
          {
            "changeSummary": {
              "add": 0,
              "change": 178,
              "ignore": 8091,
              "import": 0,
              "operation": "deploy",
              "remove": 0
            },
            "destination": "alis-bt-dev-5h1da0l/default/alis-os",
            "diagnostics": [],
            "operation": "deploy",
            "percent": 100,
            "resources": [
              {
                "action": "update",
                "elapsedSeconds": 0,
                "error": "",
                "kind": "spanner_proto_bundle_type",
                "name": "alis.os.console.v2.AccountCreatedEvent",
                "status": "COMPLETE"
              },
              {
                "action": "update",
                "elapsedSeconds": 0,
                "error": "",
                "kind": "spanner_proto_bundle_type",
                "name": "alis.os.console.v2.AddAccountMemberRequest",
                "status": "COMPLETE"
              }
            ],
            "statement": "ALTER PROTO BUNDLE UPDATE(`alis.os.console.v2.AccountCreated",
            "status": "DONE",
            "target": "spanner",
            "throttled": false
          }
        ],
        "resources": [
          {
            "action": "update",
            "address": "google_cloud_run_v2_service.console",
            "elapsedSeconds": 21,
            "id": "projects/alis-os-dev-m27/locations/europe-west1/services/console-v2",
            "status": "COMPLETE"
          },
          {
            "action": "",
            "address": "google_cloud_run_service_iam_member.iam-auth-invoker",
            "elapsedSeconds": 0,
            "id": "v1/projects/alis-os-dev-m27/locations/europe-west1/services/console-v2/roles/run.invoker/allUsers",
            "status": "COMPLETE"
          },
          {
            "action": "",
            "address": "google_compute_region_network_endpoint_group.console",
            "elapsedSeconds": 0,
            "id": "projects/alis-os-dev-m27/regions/europe-west1/networkEndpointGroups/console-v2",
            "status": "COMPLETE"
          },
          {
            "action": "",
            "address": "google_compute_backend_service.console",
            "elapsedSeconds": 0,
            "id": "projects/alis-os-dev-m27/global/backendServices/console-v2",
            "status": "COMPLETE"
          }
        ],
        "startTime": "2026-10-08T21:26:15.925081598Z",
        "steps": [
          {
            "durationMs": "16146",
            "label": "protos \u2192 Spanner",
            "status": "DONE"
          },
          {
            "durationMs": "2",
            "label": "unzip infra.zip",
            "status": "DONE"
          },
          {
            "durationMs": "1220",
            "label": "terraform init",
            "status": "DONE"
          },
          {
            "durationMs": "3446",
            "label": "terraform plan",
            "status": "DONE"
          },
          {
            "durationMs": "1861",
            "label": "terraform show",
            "status": "DONE"
          },
          {
            "durationMs": "23716",
            "label": "terraform apply",
            "status": "DONE"
          }
        ],
        "supported": true
      },
      "state": "RUNNING"
    }
  ],
  "done": true,
  "error": "",
  "images": [
    {
      "path": ".",
      "progress": {
        "actionGroupId": "BUILD .",
        "buildSteps": [],
        "changeSummary": null,
        "diagnostics": [],
        "endTime": "2026-10-08T21:26:10.300341196Z",
        "execution": "executions/a968e5d1-f9c7-4b1c-a698-835b152a998c",
        "failed": false,
        "failure": null,
        "outputs": [],
        "protoSyncs": [],
        "resources": [],
        "startTime": "2026-10-08T21:22:54.347305475Z",
        "steps": [
          {
            "durationMs": "1",
            "label": "sed s#^[Rr][Uu][Nn] #RUN --m\u2026",
            "status": "DONE"
          },
          {
            "durationMs": "193105",
            "label": "docker buildx",
            "status": "DONE"
          }
        ],
        "supported": true
      }
    }
  ],
  "logsUri": "https://deploy.alis.alis.dev/executions/dc7b2964-2e5a-48fb-b210-7b4e66f4f569",
  "name": "operations/040fff29-951b-437d-bccc-2bd650c4f8b1",
  "notes": "Deploying infrastructure to 1 environment",
  "schemaVersion": 1,
  "status": "succeeded",
  "version": "2.44.19"
}
