const URL = 'https://yzlouvxzzdhttjqdurei.supabase.co';
    const KEY = 'sb_publishable_P3UZUHHQlxUAKtZMItX1-Q_bj2qd1ug';
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    document.getElementById('year').textContent = new Date().getFullYear();
    const menu=document.querySelector('.menu'), mobile=document.querySelector('.mobile-links'); menu.addEventListener('click',()=>mobile.classList.toggle('open')); mobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mobile.classList.remove('open')));
    const form=document.getElementById('project-form'), status=document.getElementById('status');
    form.addEventListener('submit', async e=>{e.preventDefault(); status.textContent='Sending your project request…'; const data=Object.fromEntries(new FormData(form).entries());
      const {error}=await supabaseClient.from('project_requests').insert([{name:data.name,email:data.email,phone:data.phone||null,company:data.company||null,service:data.service,budget:data.budget||null,message:data.message,status:'new'}]);
      if(error){console.error(error);status.textContent='Something went wrong. Please try again.';status.style.color='#ff9b9b';return;}
      form.reset(); status.textContent='Request received. We’ll be in touch soon.'; status.style.color='#9fe5ba';
    });