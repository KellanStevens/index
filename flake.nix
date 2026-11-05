{
  description = "index: kellanstevens.com, an Astro site on Cloudflare";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

  outputs =
    { nixpkgs, ... }:
    let
      systems = [
        "aarch64-darwin"
        "x86_64-darwin"
        "aarch64-linux"
        "x86_64-linux"
      ];
      forAllSystems = f: nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});
    in
    {
      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          packages = [
            pkgs.bun
            # wrangler and parts of the Astro toolchain still expect a Node runtime
            pkgs.nodejs_22
            # Used to open pull requests (`gh pr create`), as AGENTS.md describes.
            pkgs.gh
          ];
          # CI installs the versions in .bun-version and .nvmrc. Warn when
          # nixpkgs supplies different versions, so that CI and local
          # development do not drift apart.
          shellHook = ''
            export PATH="$PWD/node_modules/.bin:$PATH"

            bun_pin=$(cat .bun-version)
            bun_have=$(bun --version)
            if [ "$bun_have" != "$bun_pin" ]; then
              echo "warning: the dev shell has Bun $bun_have, but .bun-version pins $bun_pin for CI." >&2
            fi

            node_pin=v$(cat .nvmrc)
            node_have=$(node --version)
            if [ "$node_have" != "$node_pin" ]; then
              echo "warning: the dev shell has Node $node_have, but .nvmrc pins $node_pin for CI." >&2
            fi
          '';
        };
      });

      formatter = forAllSystems (pkgs: pkgs.nixfmt);
    };
}
