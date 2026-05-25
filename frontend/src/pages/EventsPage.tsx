import { useIsMobile } from "@/hooks/useIsMobile";
import { useEventList, isEventActive } from "@/hooks/useEventList";
import { useEventDetail } from "@/hooks/useEventDetail";
import EventList from "@/components/events/EventList";
import EventDetail from "@/components/events/EventDetail";

export default function EventsPage() {
  const isMobile = useIsMobile();
  const {
    events,
    loading,
    activeTab,
    setActiveTab,
    selectedId,
    setSelectedId,
    selected,
    visibleEvents,
    showAdd,
    setShowAdd,
    newName,
    setNewName,
    newNote,
    setNewNote,
    newStart,
    setNewStart,
    newEnd,
    setNewEnd,
    saving,
    handleSelectEvent,
    handleAddEvent,
    handleDeleteEvent,
    handleCancelAdd,
  } = useEventList(isMobile);

  const {
    linkedTxs,
    recommendedTxs,
    loadingTxs,
    monthOutflow,
    eventTotal,
    eventOutflow,
    contributionPct,
    linkTx,
    unlinkTx,
  } = useEventDetail(selected);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-primary text-text-muted text-sm">
        Loading events…
      </div>
    );
  }

  const showList = !isMobile || !selectedId;
  const showDetail = !isMobile || !!selectedId;

  return (
    <div
      className={`bg-bg-primary flex flex-col ${isMobile ? "min-h-screen overflow-auto" : "h-screen overflow-hidden"}`}
    >
      <div
        className={`flex items-center justify-between shrink-0 ${isMobile ? "px-4 pt-5 pb-3" : "px-8 pt-7 pb-4"}`}
      >
        <div className="flex items-center gap-3">
          {isMobile && selectedId && (
            <button
              onClick={() => setSelectedId(null)}
              className="px-2.5 py-1.5 rounded-lg border border-border-input bg-bg-white text-text-secondary text-[13px] cursor-pointer shrink-0"
            >
              ← Back
            </button>
          )}
          <div>
            <h1 className="text-[22px] font-bold text-text-primary m-0 tracking-tight">
              Events
            </h1>
            <p className="text-[13px] text-text-secondary mt-0.5 mb-0">
              Track why a month spikes
            </p>
          </div>
        </div>
        {showList && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-bg-lime text-text-primary text-[13px] font-bold cursor-pointer border-0"
          >
            <span className="text-base leading-none">+</span> New Event
          </button>
        )}
      </div>

      <div
        className={`flex flex-1 gap-5 ${isMobile ? "flex-col px-4 pb-6 overflow-auto" : "flex-row px-8 pb-8 overflow-hidden"}`}
      >
        {showList && (
          <EventList
            events={events}
            visibleEvents={visibleEvents}
            activeTab={activeTab}
            selectedId={selectedId}
            showAdd={showAdd}
            newName={newName}
            newStart={newStart}
            newEnd={newEnd}
            newNote={newNote}
            saving={saving}
            onTabChange={setActiveTab}
            onSelectEvent={handleSelectEvent}
            onChangeName={setNewName}
            onChangeStart={setNewStart}
            onChangeEnd={setNewEnd}
            onChangeNote={setNewNote}
            onSaveAdd={handleAddEvent}
            onCancelAdd={handleCancelAdd}
            isActive={isEventActive}
          />
        )}

        {showDetail && (
          <div
            className={`flex-1 bg-bg-white rounded-xl border border-border-default flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.05)] ${isMobile ? "overflow-visible" : "overflow-hidden"}`}
          >
            {selected ? (
              <EventDetail
                selected={selected}
                linkedTxs={linkedTxs}
                recommendedTxs={recommendedTxs}
                loadingTxs={loadingTxs}
                eventTotal={eventTotal}
                eventOutflow={eventOutflow}
                monthOutflow={monthOutflow}
                contributionPct={contributionPct}
                isMobile={isMobile}
                onDelete={() => handleDeleteEvent(selected.id, selected.name)}
                onLink={linkTx}
                onUnlink={unlinkTx}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
                {events.length === 0
                  ? "Create your first event to get started"
                  : "Select an event to view details"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
