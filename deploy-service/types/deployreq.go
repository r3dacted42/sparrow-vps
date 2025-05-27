package types

type DeployRequest struct {
	ImageTag   string `json:"image_tag"`
	PathName   string `json:"path_name"`
	ExposePort int32  `json:"expose_port"`
}
