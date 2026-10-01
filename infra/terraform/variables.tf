variable "cluster_name" {
  description = "Name of the local kind cluster"
  type        = string
  default     = "roadpulse"
}

variable "image_tag" {
  description = "Docker image tag deployed for all RoadPulse services"
  type        = string
  default     = "0.1.0"
}