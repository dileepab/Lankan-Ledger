import React, { useState, useEffect } from 'react';
import { Film, Radio, Volume2, PlayCircle, Pause, Trash2, UploadCloud, Folder, FileCheck } from 'lucide-react';

interface CMSMultimediaProps {
  onNotify: (msg: string) => void;
}

export default function CMSMultimedia({ onNotify }: CMSMultimediaProps) {
  // Recorder states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recorderWaveform, setRecorderWaveform] = useState<number[]>([]);

  // Local state dispatches
  const [myDispatches, setMyDispatches] = useState([
    { id: 'disp-1', title: 'Macro Report Overview: Central Bank IMF Restructuring Review', duration: '2:14', date: 'Yesterday at 14:32', url: '#' },
    { id: 'disp-2', title: 'Export Sector Assessment: Nuwara Eliya Tea Production Surge', duration: '5:41', date: '3 days ago at 09:20', url: '#' },
    { id: 'disp-3', title: 'Port City Colombo Special Economic Zone Legislative Draft', duration: '3:05', date: '4 days ago at 17:15', url: '#' },
  ]);

  // Audio Playback states
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  // File collection states
  const [uploadedFiles, setUploadedFiles] = useState([
    { id: 'file-1', name: 'B-Roll_ColomboHarbour_Crane_Master.mp4', size: '14.8 MB', progress: 100, status: 'Completed', type: 'video' },
    { id: 'file-2', name: 'Podcast_MacroOutlook_Episode4_Draft.mp3', size: '28.1 MB', progress: 100, status: 'Completed', type: 'audio' },
  ]);
  const [isDragging, setIsDragging] = useState(false);

  // Recorder simulation
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
        // Animated wave equalizers
        const wave = Array.from({ length: 32 }, () => Math.floor(Math.random() * 85) + 15);
        setRecorderWaveform(wave);
      }, 1000);
    } else {
      setRecordingDuration(0);
      setRecorderWaveform([]);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Playback simulation
  useEffect(() => {
    let playInterval: any;
    if (playingId) {
      playInterval = setInterval(() => {
        setPlaybackProgress(p => {
          if (p >= 100) {
            setPlayingId(null);
            onNotify('Playback finished.');
            return 0;
          }
          return p + 2;
        });
      }, 250);
    } else {
      setPlaybackProgress(0);
    }
    return () => clearInterval(playInterval);
  }, [playingId]);

  const handleToggleRecord = () => {
    if (isRecording) {
      // Create new dispatch entry
      const mins = Math.floor(recordingDuration / 60);
      const secs = (recordingDuration % 60).toString().padStart(2, '0');
      const timeStr = `${mins}:${secs}`;
      const name = `Voice Briefing: IMF Restructuring Update (#${Date.now().toString().slice(-4)})`;
      
      const newD = {
        id: `disp-${Date.now()}`,
        title: name,
        duration: timeStr,
        date: 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        url: '#'
      };

      setMyDispatches(prev => [newD, ...prev]);
      setIsRecording(false);
      onNotify('Live broadcast briefing taped and finalized.');
    } else {
      setIsRecording(true);
    }
  };

  const handlePlay = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
      setPlaybackProgress(0);
    }
  };

  const handleDeleteDispatch = (id: string) => {
    setMyDispatches(prev => prev.filter(d => d.id !== id));
    if (playingId === id) setPlayingId(null);
    onNotify('Dispatch item removed.');
  };

  // Drag and Drop simulation
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      simulateFileUpload(file.name, file.size);
    }
  };

  const handleManualSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      simulateFileUpload(file.name, file.size);
    }
  };

  const simulateFileUpload = (name: string, sizeBytes: number) => {
    const sizeMB = `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
    const newF = {
      id: `file-${Date.now()}`,
      name,
      size: sizeMB === '0.0 MB' ? '2.4 MB' : sizeMB,
      progress: 5,
      status: 'Uploading' as const,
      type: name.includes('.mp3') || name.includes('.wav') ? 'audio' : 'video'
    };

    setUploadedFiles(prev => [newF, ...prev]);

    let prog = 5;
    const interval = setInterval(() => {
      prog += 15;
      if (prog >= 100) {
        prog = 100;
        clearInterval(interval);
        setUploadedFiles(curr => 
          curr.map(f => f.id === newF.id ? { ...f, progress: 100, status: 'Completed' } : f)
        );
        onNotify(`Asset "${name}" uploaded and parsed in media database!`);
      } else {
        setUploadedFiles(curr => 
          curr.map(f => f.id === newF.id ? { ...f, progress: prog } : f)
        );
      }
    }, 400);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Recording Studio & Dispatch playback */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Live Audio dispatch recorder */}
        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-xs font-black uppercase tracking-wider border-b-2 border-black pb-2 mb-4 flex items-center gap-2">
            <Radio size={14} className={isRecording ? 'text-[#b81300] animate-pulse' : 'text-zinc-600'} />
            <span>Daily dispatch Voice Studio</span>
          </h3>
          <p className="text-[10px] text-zinc-500 mb-6 uppercase font-bold">Recorders generate high-fidelity compressed briefs instantly synchronized to Ceylon Cloud servers.</p>

          <div className="border border-black bg-[#f9f9f9] p-6 flex flex-col items-center justify-center gap-6 rounded-sm relative min-h-[160px]">
            {isRecording ? (
              <div className="w-full flex flex-col items-center gap-4">
                <div className="text-2xl font-black font-mono-data text-[#b81300] flex items-center gap-2 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-[#b81300]"></span>
                  <span>{Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}</span>
                </div>
                {/* Voice waveform simulation */}
                <div className="flex items-end justify-center gap-1 h-14 w-full px-4 overflow-hidden">
                  {recorderWaveform.map((h, i) => (
                    <div 
                      key={i} 
                      className="bg-black w-1 rounded-full transition-all duration-200" 
                      style={{ height: `${h}%` }}
                    ></div>
                  ))}
                </div>
                <span className="text-[9px] font-mono-data text-[#b81300] uppercase font-bold animate-pulse">RECORDING ACTIVE / CAPTURING MIC STREAM...</span>
              </div>
            ) : (
              <div className="text-center py-4">
                <Volume2 size={36} className="mx-auto text-zinc-300 stroke-1 mb-2" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">No active stream taping session</span>
              </div>
            )}

            <button
              onClick={handleToggleRecord}
              className={`px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest border border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-white cursor-pointer ${
                isRecording ? 'bg-[#b81300]' : 'bg-black'
              }`}
            >
              {isRecording ? 'STOP & SAVE BRIEFING' : 'TAP NEW BRIEFING'}
            </button>
          </div>
        </div>

        {/* Existing audio bulletins dispatches */}
        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-xs font-black uppercase tracking-wider border-b-2 border-black pb-2 mb-4 flex items-center justify-between">
            <span>Taped Dispatches Shelf</span>
            <span className="text-[10px] font-mono font-bold uppercase opacity-50">{myDispatches.length} files</span>
          </h3>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {myDispatches.map((disp) => {
              const isPlayingNow = playingId === disp.id;
              return (
                <div key={disp.id} className="border border-zinc-200 p-3 hover:bg-zinc-50 transition-colors flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black uppercase tracking-tight truncate">{disp.title}</h4>
                    <p className="text-[10px] text-zinc-400 font-mono-data mt-1">{disp.date} • Length {disp.duration}</p>
                    
                    {isPlayingNow && (
                      <div className="mt-3 space-y-1.5 bg-[#fbfbfb] p-2 border border-black/5">
                        <div className="flex items-center justify-between text-[8px] font-mono-data text-zinc-600">
                          <span>STREAMING DISPATCH</span>
                          <span>{Math.round(playbackProgress)}%</span>
                        </div>
                        <div className="w-full bg-zinc-200 h-1.5 border border-black/10 overflow-hidden relative">
                          <div 
                            className="bg-[#b81300] h-full transition-all duration-300"
                            style={{ width: `${playbackProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePlay(disp.id)}
                      className={`p-2 border border-black hover:bg-black hover:text-white transition-all cursor-pointer ${
                        isPlayingNow ? 'bg-black text-white' : 'bg-white'
                      }`}
                      title={isPlayingNow ? 'Pause Bulletin' : 'Play Bulletin'}
                    >
                      {isPlayingNow ? <Pause size={12} /> : <PlayCircle size={12} />}
                    </button>
                    <button
                      onClick={() => handleDeleteDispatch(disp.id)}
                      className="p-2 border border-black text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete local file"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Asset pipelines & Drag-and-Drop library */}
      <div className="lg:col-span-5 space-y-6">
        
        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-xs font-black uppercase tracking-wider border-b-2 border-black pb-2 mb-4 flex items-center gap-2">
            <Volume2 size={14} className="text-zinc-600" />
            <span>Upload Media Assets</span>
          </h3>
          <p className="text-[10px] text-zinc-500 mb-4 uppercase font-bold">Inject video files, b-rolls, podcast MP3 segments, or report cards into the live content CDN.</p>

          {/* Interactive Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed p-8 rounded-sm text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[160px] ${
              isDragging 
                ? 'border-[#b81300] bg-zinc-100' 
                : 'border-zinc-300 hover:border-black bg-[#fbfbfb]'
            }`}
          >
            <UploadCloud size={28} className="text-zinc-400 mb-2" />
            <span className="text-[11px] font-bold uppercase tracking-wide">Drag media file here</span>
            <span className="text-[9px] text-zinc-400 mt-1 uppercase font-mono mb-4">(supports .mp3, .wav, .mp4, .png)</span>
            
            <label className="bg-white border border-black px-4 py-1.5 text-[9px] font-bold uppercase hover:bg-black hover:text-white cursor-pointer select-none">
              Choose File
              <input 
                type="file" 
                onChange={handleManualSelect} 
                className="hidden" 
                accept="audio/*,video/*,image/*" 
              />
            </label>
          </div>
        </div>

        {/* Uploaded assets log */}
        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-xs font-black uppercase tracking-wider border-b-2 border-black pb-2 mb-4 flex items-center gap-2">
            <Folder size={14} className="text-zinc-600" />
            <span>Cloud Multimedia Library</span>
          </h3>

          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="p-3 border border-zinc-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="truncate flex items-start gap-2">
                    <div className="p-1 border border-black/10 bg-zinc-50 shrink-0 text-[9px] uppercase font-mono font-bold mt-0.5 text-zinc-600">
                      {file.type}
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-zinc-800 uppercase tracking-tight truncate max-w-[170px]" title={file.name}>
                        {file.name}
                      </h4>
                      <p className="text-[8px] font-mono-data text-zinc-400 mt-0.5">{file.size} • Status: {file.status}</p>
                    </div>
                  </div>
                  <div>
                    {file.status === 'Completed' ? (
                      <span className="text-[9px] text-emerald-600 font-mono font-bold bg-emerald-50 px-1.5 py-0.5 border border-emerald-100 flex items-center gap-1 shrink-0">
                        <FileCheck size={10} /> Sync✓
                      </span>
                    ) : (
                      <span className="text-[9px] text-amber-600 font-mono font-bold bg-amber-50 px-1.5 py-0.5 border border-amber-100 shrink-0 animate-pulse">
                        {file.progress}% Uploading
                      </span>
                    )}
                  </div>
                </div>

                {file.status === 'Uploading' && (
                  <div className="w-full bg-zinc-200 h-1 mt-2 rounded overflow-hidden">
                    <div 
                      className="bg-black h-full transition-all duration-300" 
                      style={{ width: `${file.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
