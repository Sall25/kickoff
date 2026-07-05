import { GithubIcon } from "../icons"

const GITHUB_URL = 'https://github.com/Sall25/kickoff.git'

export function GitHubLink() {
  return (
    <a
      href={GITHUB_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="ko-github-link"
      aria-label="Kickoff on GitHub"
      title="Star Kickoff on GitHub"
    >
      <GithubIcon width={18} height={18} />
    </a>
  )
}