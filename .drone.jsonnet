local Pipeline(name, branch="master") = {
  local directory = "/exlibris/aleph/u23_3/alephe/apache/htdocs/aleph-record-load-api/app",
  kind: "pipeline",
  name: name,
  steps: [{
    name: "deploy",
    image: "quay.io/natlibfi/drone-plugin-scp",
    settings: {
      host: {
        from_secret: "host_"+name
      },
      username: {
        from_secret: "username_"+name
      },
      key: {
          from_secret: "ssh_key_"+name
      },
      target: directory,
      rm: true, 
      tar_exec: "/usr/sfw/bin/gtar",
      source: ["*.py"]
    }
  }],
  trigger: {
    branch: [branch],
    event: ["push"]
  }
};

[
  Pipeline("production"),
  Pipeline("test", branch="test")
]