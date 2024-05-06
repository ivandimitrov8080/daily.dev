{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs, ... }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs {
        inherit system;
        overlays = [
          (final: prev: {
            pnpm = prev.nodePackages_latest.pnpm.override rec {
              version = "8.15.7";
              src = prev.fetchurl {
                url = "https://registry.npmjs.org/pnpm/-/pnpm-${version}.tgz";
                sha256 = "sha256-UHg90PowOFLeLdFVfNS58Hy1sBgVSm520PQGNdbO4Bk=";
              };
            };
          })
        ];
      };
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        buildInputs = with pkgs; [
          nodePackages_latest.nodejs
          pnpm
        ];
      };
    };
}
