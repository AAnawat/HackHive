# Terraform Infrastructure Deployment Guide

This project uses **Terraform** to manage and provision infrastructure.  
Due to dependencies between environments, you **cannot run `terraform apply` directly**
on the main configuration until you complete the preparation steps below.

---

## Overview

Your infrastructure has three main components:

1. **Database** – Backend data layer
2. **Dev Server** – Application environment depending on the database
3. **Main Infrastructure** – Remaining resources that depend on a custom AMI

You will first:
1. Deploy **main**.
2. Manually **create an AMI**.
3. Use the AMI name in the **backend-app**.

---

## Step 1: Deploy Database and Dev Server (in one step)

Run the following commands:

```bash
terraform -chdir=main init
terraform -chdir=main apply -auto-approve
```

Terraform will handle the correct order of deployment automatically.

---

## Step 2: Create an AMI (Required Manual Step)

Before running Terraform, you must manually create a **custom AMI** for your servers.

You can do this via:

**AWS Console:**  
  Go to **EC2 → AMIs → Create Image**, select a base instance, and note the AMI ID/name.

Once created, record the **AMI name or ID** — you’ll need it in Step 3.

---

## 🚧 Step 3: Apply the Main Terraform Configuration

Once your AMI, database, and dev-server are ready, update your
main Terraform variables file, Example is in value/example.tfvars