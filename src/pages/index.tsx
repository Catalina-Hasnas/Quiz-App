export default function Home() {
  return (
    <>
      <div className="flex gap-0 direction-column p-1 m-1 surface-2 rad-shadow">
        <h1 className="text-align-center text-1">Quiz App</h1>
        <div className="flex justify-center">
          <input className="text-2 text-align-center font-size-m search-field" type="text" placeholder="Search..."></input>
          <button className="p-1 btn-link text-1 search-button">
            <i className="gg-search"></i>
          </button>
        </div>
      </div>
      <div className="flex grow gap-2 m-1">
        <div className="brand rad-shadow p-1">
          <h1 className="text-1">Text1</h1>
          <h1 className="text-2">Text2</h1>
        </div>
        <div className="accent rad-shadow p-1">
          <h1 className="text-1">Text1</h1>
          <h1 className="text-2">Text2</h1>
        </div>
      </div>
      <div className="flex wrap grow m-1 surface-demo">
        <div className="surface-1 rad-shadow p-1">
          <h1 className="text-1">Text1</h1>
          <h1 className="text-2">Text2</h1>
        </div>
        <div className="surface-2 rad-shadow p-1">
          <h1 className="text-1">Text1</h1>
          <h1 className="text-2">Text2</h1>
        </div>
        <div className="surface-3 rad-shadow p-1">
          <h1 className="text-1">Text1</h1>
          <h1 className="text-2">Text2</h1>
        </div>
        <div className="surface-4 rad-shadow p-1">
          <h1 className="text-1">Text1</h1>
          <h1 className="text-2">Text2</h1>
        </div>
      </div>
      <div className="flex wrap grow colors-demo m-1">
        <div className="info rad-shadow p-1">
          <h1 className="text-1">Text1</h1>
          <h1 className="text-2">Text2</h1>
        </div>
        <div className="success rad-shadow p-1">
          <h1 className="text-1">Text1</h1>
          <h1 className="text-2">Text2</h1>
        </div>
        <div className="warning rad-shadow p-1">
          <h1 className="text-1">Text1</h1>
          <h1 className="text-2">Text2</h1>
        </div>
        <div className="failure rad-shadow p-1">
          <h1 className="text-1">Text1</h1>
          <h1 className="text-2">Text2</h1>
        </div>
      </div>
      <main style={{ display: "flex", flexDirection: "column" }}>
        {/* <Link href="/login">Log in</Link>
        <Link href="/signup">Sign up</Link>
        <Link href="/profile">My profile</Link>
        <Link href="/quizzes">See all quizzes</Link>
        <Link href="/myquizzes">My quizzes</Link> */}
      </main>
    </>
  );
}
