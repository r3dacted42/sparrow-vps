package types

type PreviewRequest struct {
	ProjectType     string `form:"project_type" binding:"required,oneof=python javascript"` // Use binding tags for validation
	InstallCommand  string `form:"install_command" binding:"required"`
	EnvironmentVars string `form:"environment_vars"`

	// js only
	NodeVersion     string `form:"node_version"`
	BuildCommand    string `form:"build_command"`
	OutputDirectory string `form:"output_directory"`

	// py only
	ExposePort    string `form:"expose_port"`
	DeployCommand string `form:"deploy_command"`
}
