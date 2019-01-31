import ec2 = require('@aws-cdk/aws-ec2');
import sfn = require('@aws-cdk/aws-stepfunctions');
import cdk = require('@aws-cdk/cdk');
import path = require('path');
import ecs = require('../../lib');

const app = new cdk.App();
const stack = new cdk.Stack(app, 'aws-ecs-integ2');

const vpc = ec2.VpcNetwork.importFromContext(stack, 'Vpc', {
  isDefault: true
});

const cluster = new ecs.Cluster(stack, 'FargateCluster', { vpc });
cluster.addDefaultAutoScalingGroupCapacity({
  instanceType: new ec2.InstanceType('t2.micro'),
  vpcPlacement: { subnetsToUse: ec2.SubnetType.Public },
});

// Build task definition
const taskDefinition = new ecs.Ec2TaskDefinition(stack, 'TaskDef');
taskDefinition.addContainer('TheContainer', {
  image: ecs.ContainerImage.fromAsset(stack, 'EventImage', { directory: path.resolve(__dirname, '..', 'eventhandler-image') }),
  memoryLimitMiB: 256,
  logging: new ecs.AwsLogDriver(stack, 'TaskLogging', { streamPrefix: 'EventDemo' })
});

// Build state machine
const definition = new sfn.Pass(stack, 'Start', {
    result: { SomeKey: 'SomeValue' }
}).next(new ecs.Ec2RunTask(stack, 'RunEc2', {
  cluster, taskDefinition,
  containerOverrides: [
    {
      containerName: 'TheContainer',
      environment: [
        {
          name: 'SOME_KEY',
          valuePath: '$.SomeKey'
        }
      ]
    }
  ]
}));

new sfn.StateMachine(stack, 'StateMachine', {
  definition,
});

app.run();