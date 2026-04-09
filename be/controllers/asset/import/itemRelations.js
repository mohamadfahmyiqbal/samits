export const extractNik = (asset = {}) =>
  String(
    asset.nik ||
      asset.NIK ||
      asset.employeeNik ||
      asset.picNik ||
      ""
  ).trim();

export const extractHostname = (asset = {}) =>
  String(
    asset.hostname ||
      asset.HOSTNAME ||
      asset.hostName ||
      ""
  ).trim();