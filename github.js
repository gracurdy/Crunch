import { CONFIG } from './config.js';

const API = 'https://api.github.com';

async function gh(path, token, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.message || detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }

  if (res.status === 204) return null;
  return res.json();
}

export async function verifyToken(token) {
  const user = await gh('/user', token);
  await gh(`/repos/${CONFIG.owner}/${CONFIG.repo}`, token);
  return user;
}

/** files: [{ path, content, encoding: 'utf-8' | 'base64' }] */
export async function commitFiles(token, message, files) {
  const { owner, repo, branch } = CONFIG;
  const ref = await gh(`/repos/${owner}/${repo}/git/ref/heads/${branch}`, token);
  const latestCommitSha = ref.object.sha;
  const latestCommit = await gh(`/repos/${owner}/${repo}/git/commits/${latestCommitSha}`, token);

  const treeItems = [];
  for (const file of files) {
    const blob = await gh(`/repos/${owner}/${repo}/git/blobs`, token, {
      method: 'POST',
      body: JSON.stringify({
        content: file.content,
        encoding: file.encoding || 'utf-8'
      })
    });
    treeItems.push({
      path: file.path,
      mode: '100644',
      type: 'blob',
      sha: blob.sha
    });
  }

  const tree = await gh(`/repos/${owner}/${repo}/git/trees`, token, {
    method: 'POST',
    body: JSON.stringify({
      base_tree: latestCommit.tree.sha,
      tree: treeItems
    })
  });

  const commit = await gh(`/repos/${owner}/${repo}/git/commits`, token, {
    method: 'POST',
    body: JSON.stringify({
      message,
      tree: tree.sha,
      parents: [latestCommitSha]
    })
  });

  await gh(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, token, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha })
  });

  return commit;
}

export async function loadTripsFromRepo() {
  const url = `./${CONFIG.tripsPath}?t=${Date.now()}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Could not load ${CONFIG.tripsPath}`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.trips || [];
}
