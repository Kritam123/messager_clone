"use client";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { IoClose } from "react-icons/io5";
import { HiMicrophone, HiPaperAirplane } from "react-icons/hi2";
import { FaPlay, FaPause } from "react-icons/fa";
import WaveSurfer from "wavesurfer.js";
import { BsFillStopFill } from "react-icons/bs";
import axios from "axios";
import useConversation from "../../../hooks/useConversation";
interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const RecordModal: React.FC<RecordModalProps> = ({ isOpen, onClose }) => {
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [wavrForm, setWaveForm] = useState<WaveSurfer |null>(null);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
   const [currentPlaybackTime, setCurrentPlaybackTime] = useState<number>(0);
   const [renderedAudio, setRenderedAudio] = useState<File>();
  const [recordedAudio, setRecordedAudio] = useState<HTMLAudioElement | null>();
  const [audiodedUrl, setAudiodedUrl] = useState<string>();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecordedRef = useRef<MediaRecorder | null>(null);
  const waveRef = useRef<HTMLDivElement>(null);
  const { conversationId } = useConversation();
  useEffect(() => {
    if (!isRecording && audiodedUrl) {
      const WaveSurferInstance = WaveSurfer.create({
        container: waveRef.current!,
        waveColor: "violet",
        progressColor: "purple",
        barHeight: 1,
        barGap: 4,
        cursorWidth: 0,
        barWidth: 2,
      });
      setWaveForm(WaveSurferInstance);
      WaveSurferInstance.on("finish", () => {
        setIsPlaying(false);
      });
      WaveSurferInstance!.load(audiodedUrl);

      return () => {
        WaveSurferInstance!.destroy();
      };
    }
  }, [audiodedUrl]);

  const handleTimer = () => {
    onClose();
    setIsRecording(false);
    setRecordingDuration(0);
    setTotalDuration(0);
    setAudiodedUrl(undefined);
  };
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => {
          setTotalDuration(prev + 1);
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isRecording]);
  const handleRecording = async () => {
    try {
      setIsRecording(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecordedRef.current = recorder;
        const chucks: Blob[] = [];
      recorder.ondataavailable = (event) => {
       chucks.push(event.data)
      };
      recorder.onstop = () => {
        const audioBlob = new Blob(chucks, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        console.log(audioUrl)
        setRecordedAudio(audio);
        setAudiodedUrl(audioUrl);
      };
      recorder.start();
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };
  const handleStopRecording = () => {
    if (mediaRecordedRef.current && isRecording) {
      mediaRecordedRef.current.stop();
      setIsRecording(false);
      setRecordingDuration(0);
      const audioChucks: Blob[] = [];
      mediaRecordedRef.current.addEventListener("dataavailable", (e) => {
        audioChucks.push(e.data);
      });
      mediaRecordedRef.current.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChucks, { type: "audio/mp3" });
        const audiofile = new File([audioBlob], "recording.mp3");
        setRenderedAudio(audiofile);
      });
    }
  };
  useEffect(() => {
    if (recordedAudio) {
      const updatePlaybackTime = () => {
        setCurrentPlaybackTime(recordedAudio.currentTime);
      };
      recordedAudio?.addEventListener("timeupdate", updatePlaybackTime);
      return () => {
        recordedAudio?.removeEventListener("timeupdate", updatePlaybackTime);
      };
    }
  }, [recordedAudio]);
  const formateTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`;
  };
  const handlePlayRecord = () => {
    if (recordedAudio) {
      wavrForm!.stop();
      wavrForm!.play();
      recordedAudio.play();
      setIsPlaying(true);
    }
  };
  const handlePauseRecord = () => {
    if (audiodedUrl) {
      wavrForm!.stop();
      recordedAudio!.pause(); 
      setIsPlaying(false);
    }
  };
  const sendVoiceMessage = async(result: any) => {
    console.log(re)
    try {
      const response = await axios.post("/api/messages", {
        voiceMessage:renderedAudio,
        conversationId,
      });

    } catch (error) {
      console.log(error)
    }
    
  };
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleTimer}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="
            fixed 
            inset-0 
            bg-gray-500 
            bg-opacity-75 
            transition-opacity
          "
          />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div
            className="
            flex 
            min-h-full 
            items-center 
            justify-center 
            p-4 
            text-center 
            sm:p-0
          "
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className="
                relative 
                transform 
                overflow-hidden 
                rounded-lg 
                bg-white 
                px-4 
                pb-4
                pt-5 
                text-left 
                shadow-xl 
                transition-all
                w-full
                sm:my-8 
                sm:w-full 
                sm:max-w-lg 
                sm:p-6
              "
              >
                <div
                  className="
                  absolute 
                  right-0 
                  top-0 
                  hidden 
                  pr-4 
                  pt-4 
                  sm:block
                  z-10
                "
                >
                  <button
                    type="button"
                    className="
                    rounded-md 
                    bg-white 
                    text-gray-400 
                    hover:text-gray-500 
                    focus:outline-none 
                    focus:ring-2 
                    focus:ring-indigo-500 
                    focus:ring-offset-2
                  "
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <IoClose
                      onClick={handleTimer}
                      className="h-6 w-6"
                      aria-hidden="true"
                    />
                  </button>
                </div>
                <div className="flex flex-col">
                  <h1>Sender Recording Message :</h1>
                  <div className="flex items-center  gap-5 mt-5">
                    {!isRecording ? (
                      <button
                        type="submit"
                        className="rounded-full p-2 hover:bg-sky-600 bg-sky-500 block cursor-pointer transition"
                      >
                        <HiMicrophone
                          onClick={handleRecording}
                          size={20}
                          className="text-white "
                        />
                      </button>
                    ) : (
                      <>
                        <button
                          type="submit"
                          className="rounded-full p-2 hover:bg-sky-600 bg-sky-500 block cursor-pointer transition"
                        >
                          <BsFillStopFill
                            onClick={handleStopRecording}
                            size={20}
                            className="text-white "
                          />
                        </button>
                      </>
                    )}
                    {isRecording ? (
                      <div className="text-[#0EA5E9] animate-pulse 2-60  text-md w-32 ">
                        <span>Recording {formateTime(recordingDuration)}</span>
                      </div>
                    ) : (
                      <>
                        {audiodedUrl && !isRecording && (
                          <>
                          <div className="flex items-center gap-10 px-4 w-60 bg-slate-200 overflow-hidden">
                            {!isPlaying ? (
                              <button
                              onClick={handlePlayRecord}
                                type="submit"
                                className="rounded-full p-2 hover:bg-sky-600 bg-sky-500 block cursor-pointer transition"
                              >
                                <FaPlay  className="text-white text-sm"  size={15} />
                              </button>
                            ) : (
                              <button
                                type="submit"
                                onClick={handlePauseRecord}
                                className="rounded-full p-2 hover:bg-sky-600 bg-sky-500 block cursor-pointer transition"
                              >
                                <FaPause
                                className="text-white text-sm"
                                  
                                  size={15}
                                />
                              </button>
                            )}
                           
                            <div
                              className="w-60 rounded-lg overflow-hidden "
                              ref={waveRef}
                             / >
                            <audio ref={audioRef} hidden/>

                            <span>{formateTime(totalDuration)}</span>
                          </div>
                            <button
                            onClick={sendVoiceMessage}
                            type="submit"
                            className="rounded-full p-2 hover:bg-sky-600 bg-sky-500 cursor-pointer transition"
                            >
                            <HiPaperAirplane  size={20} className="text-white " />
                          </button>
                          </>
                        )}
                      </>
                    )}
                  
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default RecordModal;
