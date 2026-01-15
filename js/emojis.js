const emojis = ["😀","😂","😍","😎","😢","👍","🎉","💡"];
const picker = document.getElementById("emojiPicker");
if(picker){
  emojis.forEach(e=>{
    const b = document.createElement("button");
    b.textContent = e;
    b.style.fontSize="18px";
    b.style.margin="2px";
    b.onclick = () => {
      const input = document.getElementById("messageInput");
      input.value += e;
      input.focus();
    };
    picker.appendChild(b);
  });
}
