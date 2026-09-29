import WebsitesBuilderWorkspace from "./WebsitesBuilderWorkspace";

export default function LandingBuilderWorkspace({
  onBack,
}: {
  onBack?: () => void;
}) {
  return (
    <WebsitesBuilderWorkspace
      initialKind="landing"
      onBack={onBack}
    />
  );
}
