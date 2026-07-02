export function getRouteForMaterial(materialName: string) {
  return materialName === 'hiroto-profile'
    ? '/about'
    : materialName === 'to_projects'
      ? '/projects'
      : materialName === 'to_contact'
        ? '/contact'
        : null;
}
