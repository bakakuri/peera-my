export function speak(text,language='de'){
  if(window.peeraSoundEnabled===false) return false;
  if(!('speechSynthesis' in window)) return false;
  const voice=new SpeechSynthesisUtterance(String(text));
  voice.lang=({de:'de-DE',en:'en-GB',es:'es-ES'}[language]||'de-DE');
  voice.rate=.86;voice.pitch=1;
  speechSynthesis.cancel(); speechSynthesis.speak(voice);
  return true;
}
export function listen(callback,language='de'){
  const Rec=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Rec)return false;
  const rec=new Rec();rec.lang=({de:'de-DE',en:'en-GB',es:'es-ES'}[language]||'de-DE');rec.interimResults=false;
  rec.onresult=e=>callback(e.results[0][0].transcript);
  rec.onerror=e=>callback(null,e.error);
  rec.start();return true;
}
