# Voice Recording & Transcription Setup

This document explains how to set up and use the voice recording and transcription feature in TreeMind.

## Features

- **Real-time transcription** using Web Speech API (browser-native)
- **No external API dependencies** - completely free and privacy-friendly
- **Cross-browser compatibility** with graceful fallbacks
- **Helpful error messages** that encourage typing when voice recording isn't available

## Setup Instructions

### 1. Browser Permissions

The app will request microphone permission when you first use voice recording. Make sure to:
- Allow microphone access when prompted
- Use HTTPS in production (required for microphone access)
- Test in a modern browser (Chrome, Firefox, Safari, Edge)

## How It Works

### Web Speech API Only
- **Real-time transcription** as you speak
- **No external API calls** (privacy-friendly)
- **Works offline** in supported browsers
- **Browser-native** - no additional setup required
- **Graceful fallback** - shows helpful error message when not supported

## Usage

1. **Start Recording**: Click the "Voice Rant" button
2. **Speak**: The app will transcribe your speech in real-time
3. **Stop Recording**: Click "Stop Recording" when done
4. **Review**: Check the transcribed text in the text area
5. **Edit**: Make any necessary corrections
6. **Save**: Save your entry as usual

### When Voice Recording Isn't Available

If voice recording isn't supported or fails, you'll see a helpful error message that:
- Explains what went wrong
- Encourages you to type your entry instead
- Reminds you that voice recording is just a convenience feature

## Browser Support

| Browser | Web Speech API | Status |
|---------|----------------|---------|
| Chrome | ✅ | Full support |
| Firefox | ✅ | Full support |
| Safari | ✅ | Full support |
| Edge | ✅ | Full support |

## Troubleshooting

### Common Issues

1. **"Voice recording is not supported in your browser"**
   - Use a modern browser (Chrome, Firefox, Safari, Edge)
   - Ensure you're using HTTPS in production

2. **"Microphone permission denied"**
   - Check browser permissions
   - Refresh the page and allow microphone access
   - Click the microphone icon in your browser's address bar

3. **"No speech detected"**
   - Try speaking more clearly and closer to the microphone
   - Check that your microphone is working
   - Ensure you're in a quiet environment

4. **"Network error"**
   - Check your internet connection
   - Web Speech API requires internet for processing

### Error Messages

- **Speech recognition error**: Web Speech API failed
- **Microphone access failed**: Hardware or permission issue
- **Network error**: Internet connection required for processing

## Cost

- **Web Speech API**: Completely free (browser-native)
- **No external API costs**: No additional charges

## Privacy & Security

- **Web Speech API**: Audio processed by browser's speech recognition service
- **No audio storage**: Audio is not saved permanently
- **HTTPS required**: For microphone access in production
- **Privacy-friendly**: No data sent to external services

## Development

### Files Created/Modified

- `src/hooks/useVoiceRecording.ts` - Voice recording hook (Web Speech API only)
- `src/components/ui/CreateEntryFormv0.tsx` - Updated form component with error handling

### Testing

To test the voice recording feature:

1. Start the development server: `npm run dev`
2. Navigate to `/create`
3. Click "Voice Rant" and allow microphone access
4. Speak clearly and watch for real-time transcription
5. Stop recording and verify the text appears

### Testing Error Handling

To test error handling:

1. Try using an unsupported browser
2. Deny microphone permission when prompted
3. Disconnect from the internet and try recording
4. Verify that helpful error messages appear

## Future Enhancements

- [ ] Language selection
- [ ] Custom vocabulary support
- [ ] Offline transcription with local models
- [ ] Voice commands for editing
