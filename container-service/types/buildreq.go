package types

type BuildRequest struct {
	RepositoryOwner string `json:"repository_owner"`
	RepositoryName  string `json:"repository_name"`
	ProjectType     string `json:"project_type"` // "javascript" or "python"
	Dockerfile      string `json:"dockerfile"`
}
