import aws_cdk.aws_dynamodb as dynamodb
import aws_cdk.cdk as cdk


def DynamoPostsTable(parent: cdk.Construct, name: str):
    self = cdk.Construct(parent, name)

    table = dynamodb.Table(self, "Table", {"readCapacity": 5, "writeCapacity": 5})

    table.add_partition_key({"name": "Alias", "type": dynamodb.AttributeType.String})
    table.add_sort_key({"name": "Timestamp", "type": dynamodb.AttributeType.String})

    return self