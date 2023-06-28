export default function Home() {
  return (
    <>
      <div className="flex gap-0 direction-column p-1 m-1 surface-2 rad-shadow">
        <h1 className="text-align-center text-1">Quiz App</h1>
        <div className="flex justify-center">
          <input
            className="text-2 text-align-center font-size-m search-field"
            type="text"
            placeholder="Search..."
          ></input>
          <button className="p-1 btn-link text-1 search-button">
            <i className="gg-search"></i>
          </button>
        </div>
      </div>
      <div className="flex grow gap-1 m-1">
        <div className="brand rad-shadow p-1">
          <h1 className="text-1">Brand Text1</h1>
          <h1 className="text-2">Brand Text2</h1>
        </div>
        <div className="accent rad-shadow p-1">
          <h1 className="text-1">Accent Text1</h1>
          <h1 className="text-2">Accent Text2</h1>
        </div>
      </div>
      <div className="flex wrap grow m-1 surface-demo">
        <div className="surface-1 rad-shadow p-1">
          <h1 className="text-1">Surface-1</h1>
          <h1 className="text-2">Surface-1</h1>
        </div>
        <div className="surface-2 rad-shadow p-1">
          <h1 className="text-1">Surface-2</h1>
          <h1 className="text-2">Surface-2</h1>
        </div>
        <div className="surface-3 rad-shadow p-1">
          <h1 className="text-1">Surface-3</h1>
          <h1 className="text-2">Surface-3</h1>
        </div>
        <div className="surface-4 rad-shadow p-1">
          <h1 className="text-1">Surface-4</h1>
          <h1 className="text-2">Surface-4</h1>
        </div>
      </div>
      <div className="flex wrap grow colors-demo m-1">
        <div className="info rad-shadow p-1">
          <h1 className="text-1">Info</h1>
          <h1 className="text-2">Info</h1>
        </div>
        <div className="success rad-shadow p-1">
          <h1 className="text-1">Success</h1>
          <h1 className="text-2">Success</h1>
        </div>
        <div className="warning rad-shadow p-1">
          <h1 className="text-1">Warning</h1>
          <h1 className="text-2">Warning</h1>
        </div>
        <div className="failure rad-shadow p-1">
          <h1 className="text-1">Failure</h1>
          <h1 className="text-2">Failure</h1>
        </div>
      </div>
      <main style={{ display: "flex", flexDirection: "column" }}></main>
    </>
  );
}
