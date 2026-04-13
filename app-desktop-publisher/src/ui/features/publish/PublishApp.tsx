import AppHeader from '../../components/publish/AppHeader.tsx'
import PresetFormSection from '../../components/publish/PresetFormSection.tsx'
import SavedPresetsSection from '../../components/publish/SavedPresetsSection.tsx'
import { useAuth } from '../auth/AuthContext.tsx'
import { usePublishApp } from './usePublishApp.ts'

const PublishApp = () => {
  const { user, isDeveloper } = useAuth()
  const model = usePublishApp()

  if (!user) return null

  const isImplementor = user.role === 'implementor'

  const emptyPresetMessage = isDeveloper
    ? 'Belum ada preset. Isi form lalu klik Simpan.'
    : 'Belum ada preset.'

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <AppHeader isDeveloper={isDeveloper} />

      {isDeveloper ? (
        <PresetFormSection
          name={model.name}
          setName={model.setName}
          sourcePaths={model.sourcePaths}
          destPath={model.destPath}
          saveError={model.saveError}
          savingPreset={model.savingPreset}
          sourcesReady={model.sourcesReady}
          copying={model.copying}
          appendSourceFolders={model.appendSourceFolders}
          appendSourceFiles={model.appendSourceFiles}
          clearSourcePaths={model.clearSourcePaths}
          selectDestination={model.selectDestination}
          savePreset={model.savePreset}
        />
      ) : null}

      <SavedPresetsSection
        presets={model.presets}
        copyingPresetId={model.copyingPresetId}
        progress={model.progress}
        currentFile={model.currentFile}
        totalFiles={model.totalFiles}
        copying={model.copying}
        canDelete={isDeveloper}
        canPublish={isImplementor}
        emptyMessage={emptyPresetMessage}
        onDelete={model.deletePreset}
        onPublish={model.publishPreset}
      />
    </main>
  )
}

export default PublishApp
