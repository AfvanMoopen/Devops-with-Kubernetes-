Query:

scalar(sum(kube_pod_info{namespace="prometheus", created_by_kind="StatefulSet"}))
