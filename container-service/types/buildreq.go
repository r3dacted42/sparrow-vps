package types

type BuildRequest struct {
	RepoOwner   string `json:"repo_owner"`
	RepoName    string `json:"repo_name"`
	ProjectType string `json:"project_type"` // "javascript" or "python"
	Dockerfile  string `json:"dockerfile"`
}
