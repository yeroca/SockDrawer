import { Container } from "react-bootstrap";

const Usage = () => {
  return (
    <>
      <Container className="ms-2">
        <h4>Purpose</h4>
        <p>
          SockDrawer is an Everquest social button (aka macro) editor that you
          use while you are logged out of the game. With it, you can rearrange
          your Everquest social buttons, as well as edit them in a more
          user-friendly way than the game itself allows. For example, you can
          easily copy and paste lines, shift lines up and down, just like you
          would in an editor like Notepad. Everquest itself doesn't allow you to
          move social buttons around, but SockDrawer does.
        </p>
        <p>
          If you have tried to edit a{" "}
          <i>&lt;character&gt;_&lt;server&gt;_&lt;class&gt;</i>
          .ini file before, you might wonder if SockDrawer deals with the hot
          buttons that "link" to the social buttons. The answer is yes;
          SockDrawer searches for and updates all of your hot buttons that are
          connected with the two buttons you swapped.
        </p>
        <p>
          So, in general, SockDrawer is a big-ish upgrade to the in-game social
          button editor, except that you have to use it while logged out, which
          is admittedly a disadvantage.
        </p>
        <h4>Usage</h4>
        <ol>
          <li key="st10">
            Log out of your Everquest account completely, because it's not clear
            when Everquest reads and writes your{" "}
            <i>&lt;character&gt;_&lt;server&gt;_&lt;class&gt;</i>.ini file.
          </li>
          <li>
            Widen the browser window as much as possible on your monitor, as
            this will make the button labels fit better.
          </li>
          <li>
            After choosing your{" "}
            <i>&lt;character&gt;_&lt;server&gt;_&lt;class&gt;</i>.ini file from
            your Everquest folder at the top of the home SockDrawer page, you
            can:
            <ul>
              <li key="ul1">
                Click and drag a button from one location to another to swap
                those two buttons.
              </li>
              <li key="ul2">
                Double click on a button to view and/or edit its contents.
              </li>
              <li key="ul3">
                Double click on a button and then click the "Copy button" to
                copy all of the data for a button (name, color, lines) into your
                clipboard. To use the copied data, double click a currently
                empty button, and then click into the "Use Ctrl-v to paste
                button here" area, and type Ctrl-V to paste the data. This will
                fill in all of the fields of the button. This mechanism provides
                a way to share social buttons between different characters, with
                your friends, guildmates, etc. The data can be posted to Discord
                or other social media platforms. Other users can then highlight
                and copy the data, and paste it into SockDrawer as described
                above.
              </li>
              <li key="ul4">
                Within the double-clicked button dialog you can assign a social
                button to a hot button by clicking a hot button on the 2x6 grid
                of hot buttons.
                <ul>
                  <li key="ul4_li1">
                    If a hot button is already assigned, and you want to
                    overwrite it, you can either check the "Allow ovewrite"
                    checkbox, or click the "Clear" button below the hot button
                    to clear out its current contents and allow a new
                    assignment.
                  </li>
                  <li key="ul4_li2">
                    You can select which hot bar and page to assign to either by
                    clicking on a row in the table of hot buttons that the
                    social button is already assigned to, or you can manually
                    select the hot bar and page via the drop downs above the hot
                    buttons.
                  </li>
                  <li key="ul4_li3">
                    If you made a mistake in the hot button assignment, you can
                    click the same hot button again, and it will revert to its
                    previous assignment.
                  </li>
                  <li key="ul4_li4">
                    The social button edit(s) and hot button assignment(s) will
                    be saved when you click the "Accept" button. If you click
                    the "X" in the upper right corner of the dialog, all social
                    button editing and hot button assignment changes will be
                    discarded.
                  </li>
                  <li key="ul4_li5">
                    Note: hot buttons that are not set to social buttons, for
                    example clickable items or commands such as "sit", will
                    display as "occupied" instead of how they appear in game.
                    This is because SockDrawer does not have access to the
                    in-game icons, so it cannot display them as they appear in
                    game.
                  </li>
                </ul>
              </li>
            </ul>
          </li>
          <li>
            When you are finished, click the Download button below. SockDrawer
            will store the file wherever you normally download files to, for
            example your Downloads folder.
          </li>
        </ol>
        <p>
          <strong>Warning: </strong>Before copying or moving the downloaded file
          to your Everquest folder, make sure to rename, move, or backup your
          original <i>&lt;character&gt;_&lt;server&gt;_&lt;class&gt;</i>.ini
          file.
        </p>
        <h4>Known issues</h4>
        <ul>
          <li key="ki_li1">
            If you have added whole-line comments to your{" "}
            <i>&lt;character&gt;_&lt;server&gt;_&lt;class&gt;</i>.ini file,
            those comments will be removed from the subsequently downloaded
            file. There will be no fix for this issue because of the way the
            .ini file is read, modified, and then written by SockDrawer.
          </li>
          <li key="ki_li2">
            You may notice that some buttons on page 1 appear empty. This is
            because some buttons, if empty, have default values given by the
            game itself, such as a button for Consider which does a /con
            command. These defaults do not actually appear in the{" "}
            <i>&lt;character&gt;_&lt;server&gt;_&lt;class&gt;</i>.ini file, so
            SockDrawer does not display them. I don't see a strong reason to
            emulate this default behavior in SockDrawer, so instead you will see
            blank buttons there if you haven't redefined them already. I don't
            expect to change this behavior in the future.
          </li>
        </ul>
        <h4>Known issues in version 1.2+</h4>
        <ul>
          <li key="kir_li3">
            After loading a{" "}
            <i>&lt;character&gt;_&lt;server&gt;_&lt;class&gt;</i>.ini, if you
            then switch to one of the documentation pages, and back again, the
            file name in the "Browse..." field will say, "No file selected".
            However this is just visual, because SockDrawer still knows the file
            name, as shown in the header of the social button pages.
          </li>
        </ul>
        <h4>Future features</h4>
        <ul>
          <li key="ff_li1">Maybe add a search capability</li>
        </ul>
      </Container>
    </>
  );
};

export default Usage;
