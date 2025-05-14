<div class="anon-settings container">
  <h2>הגדרות אנונימיות</h2>
  <form method="post" action="/api/user/anon-settings">
    <div class="form-group">
      <label for="anonName">שם אנונימי</label>
      <input type="text" id="anonName" name="anonName" value="{anonName}" class="form-control">
    </div>
    <div class="form-group">
      <label for="anonPic">קישור לתמונה אנונימית</label>
      <input type="text" id="anonPic" name="anonPic" value="{anonPic}" class="form-control">
    </div>
    <button type="submit" class="btn btn-primary">שמור</button>
  </form>
</div>
