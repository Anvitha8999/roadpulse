provider "kind" {}

provider "helm" {
  kubernetes = {
    host                   = kind_cluster.roadpulse.endpoint
    client_certificate     = kind_cluster.roadpulse.client_certificate
    client_key             = kind_cluster.roadpulse.client_key
    cluster_ca_certificate = kind_cluster.roadpulse.cluster_ca_certificate
  }
}

resource "kind_cluster" "roadpulse" {
  name           = var.cluster_name
  wait_for_ready = true

  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"

    node {
      role = "control-plane"

      extra_port_mappings {
        container_port = 30080
        host_port      = 8080
      }
    }
  }
}

resource "terraform_data" "load_images" {
  triggers_replace = [kind_cluster.roadpulse.id, var.image_tag]

  provisioner "local-exec" {
    command = "kind load docker-image roadpulse-backend:${var.image_tag} roadpulse-model:${var.image_tag} roadpulse-frontend:${var.image_tag} --name ${kind_cluster.roadpulse.name}"
  }
}

resource "helm_release" "roadpulse" {
  name             = "roadpulse"
  chart            = "${path.module}/../../deploy/helm/roadpulse"
  namespace        = "roadpulse"
  create_namespace = true
  wait             = true
  timeout          = 600

  set = [
    {
      name  = "imageTag"
      value = var.image_tag
    }
  ]

  depends_on = [terraform_data.load_images]
}
