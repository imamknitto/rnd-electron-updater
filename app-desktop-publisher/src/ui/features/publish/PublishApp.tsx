import AppHeader from '../../components/publish/AppHeader.tsx'
import PresetFormSection from '../../components/publish/PresetFormSection.tsx'
import SavedPresetsSection from '../../components/publish/SavedPresetsSection.tsx'
import HistoryPresetsSection from '../../components/publish/HistoryPresetsSection.tsx'
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

  const emptyHistoryMessage = 'Belum ada history publikasi.'

  const savedPresetsSection = (
    <SavedPresetsSection
      presets={model.presets}
      copyingPresetId={model.copyingPresetId}
      progress={model.progress}
      currentFile={model.currentFile}
      totalFiles={model.totalFiles}
      copying={model.copying}
      canDelete={isDeveloper}
      canPublish={isImplementor}
      canEdit={isDeveloper}
      emptyMessage={emptyPresetMessage}
      onDelete={model.deletePreset}
      onPublish={model.publishPreset}
      onEdit={model.editPreset}
    />
  )

  const historyPresetsSection = (
    <HistoryPresetsSection records={model.historyRecords} emptyMessage={emptyHistoryMessage} />
  )

  const tabClass = (isActive: boolean) =>
    `px-4 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'border-b-2 border-neutral-900 text-neutral-900'
        : 'border-b-2 border-neutral-200 text-neutral-500 hover:text-neutral-700'
    }`

  return (
    <>
      <main className="mx-auto w-full px-4 py-4">
        <AppHeader isDeveloper={isDeveloper} />

        {isDeveloper ? (
          <div className="mt-8 flex flex-row gap-5 h-[calc(100vh-200px)]">
            <div className="w-[30%] h-full">
              <PresetFormSection
                name={model.name}
                setName={model.setName}
                sourcePaths={model.sourcePaths}
                destPath={model.destPath}
                saveError={model.saveError}
                savingPreset={model.savingPreset}
                sourcesReady={model.sourcesReady}
                copying={model.copying}
                isEditing={model.isEditing}
                appendSourceFolders={model.appendSourceFolders}
                appendSourceFiles={model.appendSourceFiles}
                clearSourcePaths={model.clearSourcePaths}
                selectDestination={model.selectDestination}
                resetForm={model.resetPresetForm}
                savePreset={model.savePreset}
              />
            </div>
            <div className="w-[70%] h-full flex flex-col">
              <div className="flex gap-0">
                <button
                  type="button"
                  className={tabClass(!model.showHistory)}
                  onClick={() => model.toggleShowHistory()}
                >
                  Daftar Preset
                </button>
                <button
                  type="button"
                  className={tabClass(model.showHistory)}
                  onClick={() => model.toggleShowHistory()}
                >
                  History Publikasi
                </button>
              </div>
              <div className="flex-1">
                {model.showHistory ? historyPresetsSection : savedPresetsSection}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[calc(100vh-180px)] flex flex-col">
            <div className="flex gap-0">
              <button
                type="button"
                className={tabClass(!model.showHistory)}
                onClick={() => model.toggleShowHistory()}
              >
                Daftar Preset
              </button>
              <button
                type="button"
                className={tabClass(model.showHistory)}
                onClick={() => model.toggleShowHistory()}
              >
                History Publikasi
              </button>
            </div>
            <div className="pt-0 flex-1">
              {model.showHistory ? historyPresetsSection : savedPresetsSection}
            </div>
          </div>
        )}
      </main>
    </>
  )
}

export default PublishApp
