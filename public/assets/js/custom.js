
// Show url of video in the employee cover letter body template
let current_video_url_element = document.querySelector('#current_video_url')
current_video_url_element.setAttribute('href', window.location.href)
current_video_url_element.innerText = window.location.href

// Copy cover letter body template to clipboard
let copy_clipboard_btn = document.querySelector('#copy-clipboard-btn')
let cover_letter_text = document.querySelector('#cover-letter-text')
copy_clipboard_btn.onclick = () => {
  let tmp_textarea = document.createElement('textarea');
  document.querySelector('body').appendChild(tmp_textarea);
  tmp_textarea.value = cover_letter_text.innerText;
  tmp_textarea.select();
  document.execCommand('copy');
  tmp_textarea.remove();
  copy_clipboard_btn.innerText = 'COPIED'
  copy_clipboard_btn.disabled = true;
}