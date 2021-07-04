DBaaS:
+ Out of box backup solution
+ Scaling is easy, and also HA option is provided
- Possible compatibility issues, if dev env runs on pgsql and staging/prod runs on google cloud sql
- Setting up local (offline) dev version requires extra work
- Even smallest database adds about ~10$ worth of cost to project (db-pg-f1-micro instance, 10G ssd, 1G backup)
- Might cause vendor lock (changing from gcs to rds requires some extra work)

Self hosted PGSql:
+ For small projects, doesn't really add any extra costs (as the needed resources come from kube cluster)
+ Moving from local dev to staging/production is easy, as the application stays identical, and config is inside the cluster config
+ Identical application in dev and staging/prod .. no version compatibility issues
+ Environment isn't locked to cloud provider. PGSql works the same in gke as it does in eks.
- Scaling / HA requires manual configuration work
- Doesn't provide any backup mechanism out of box
