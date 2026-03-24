# Prompts Used to Build the Kueue Console Plugin

## 1. Initial Request
> i want to build a dynamic plugin for the openshift console

## 2. Detailed Requirements with Multi-Agent Approach
> i want to build a dynamic plugin for the openshift console. This plugin is for the Red Hat Build of Kueue. I want you to analyze the codebase and recommend the best possible user experience. let's spin up a couple different agents. One will be a UX agent, the next will be an architect agent, and the last will be a system admin cluster agent to be the consumer of the plugin. Get feedback from all agents. You can use the openshift dynamic plugin template as starting point

## 3. Security Agent
> can you also spin up a security agent to make sure that we use correct libraries and images and do not introduce security vulnerabilities

## 4. Production Quality Agent
> i also want you to spin me up an agent that will ensure that this will be a production quality plugin

## 5. Model Upgrade
> can we change model to use opus 4.6 1 million context window first

## 6. Opus Review
> have opus review the plan

## 7. Build and Deploy
> I have already logged into oc for this terminal. Go build this and deploy it.

## 8. Install Kueue
> red hat build of kueue is not installed. install it on the openshift cluster

## 9. Dashboard Improvement
> lets spin up an agent to do a design review. The overview dashboard is very plain. Can you improve

## 10. Save Prompts
> list out all the prompts I gave you in a separate markdown file so that I can save it
