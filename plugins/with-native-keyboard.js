const {
  withAndroidManifest,
  withDangerousMod,
  withMainApplication,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

function packagePath(packageName) {
  return packageName.split(".").join(path.sep);
}

function addImport(source, importLine) {
  if (source.includes(importLine)) return source;
  const packageLine = source.match(/^package [^\n]+\n/m);
  return packageLine ? source.replace(packageLine[0], `${packageLine[0]}\n${importLine}\n`) : `${importLine}\n${source}`;
}

function registerPackage(source, packageName) {
  const importLine = `import ${packageName}.keyboard.KeyboardPackage`;
  let updated = addImport(source, importLine);
  if (updated.includes("KeyboardPackage()")) return updated;

  const kotlinPackages = "PackageList(this).packages";
  if (updated.includes(kotlinPackages)) {
    return updated.replace(kotlinPackages, `${kotlinPackages}.apply { add(KeyboardPackage()) }`);
  }

  const javaPackages = "new PackageList(this).getPackages()";
  if (updated.includes(javaPackages)) {
    return updated.replace(javaPackages, `${javaPackages}; packages.add(new KeyboardPackage())`);
  }

  return updated;
}

function writeAndroidSources(config, projectRoot) {
  const packageName = config.android?.package || "space.manus.ioskey";
  const packageDir = path.join(projectRoot, "app", "src", "main", "java", packagePath(packageName), "keyboard");
  const xmlDir = path.join(projectRoot, "app", "src", "main", "res", "xml");
  const valuesDir = path.join(projectRoot, "app", "src", "main", "res", "values");
  fs.mkdirSync(packageDir, { recursive: true });
  fs.mkdirSync(xmlDir, { recursive: true });
  fs.mkdirSync(valuesDir, { recursive: true });

  const packageDecl = `package ${packageName}.keyboard;`;
  fs.writeFileSync(path.join(packageDir, "KeyboardPreferencesModule.java"), `${packageDecl}

import android.content.Intent;
import android.content.SharedPreferences;
import android.provider.Settings;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class KeyboardPreferencesModule extends ReactContextBaseJavaModule {
  private static final String PREFS = "ioskey.preferences";
  private final ReactApplicationContext context;

  public KeyboardPreferencesModule(ReactApplicationContext context) {
    super(context);
    this.context = context;
  }

  @NonNull
  @Override
  public String getName() {
    return "KeyboardPreferences";
  }

  private SharedPreferences prefs() {
    return context.getSharedPreferences(PREFS, 0);
  }

  @ReactMethod
  public void setKeyboardHeight(int height) {
    prefs().edit().putInt("height", Math.max(220, Math.min(360, height))).apply();
  }

  @ReactMethod
  public void setAutoCorrectEnabled(boolean enabled) {
    prefs().edit().putBoolean("autoCorrect", enabled).apply();
  }

  @ReactMethod
  public void setSuggestionsEnabled(boolean enabled) {
    prefs().edit().putBoolean("suggestions", enabled).apply();
  }

  @ReactMethod
  public void setTheme(String theme) {
    prefs().edit().putString("theme", theme).apply();
  }

  @ReactMethod
  public void openInputMethodSettings() {
    Intent intent = new Intent(Settings.ACTION_INPUT_METHOD_SETTINGS);
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    context.startActivity(intent);
  }

  @ReactMethod
  public void showInputMethodPicker() {
    android.view.inputmethod.InputMethodManager manager =
      (android.view.inputmethod.InputMethodManager) context.getSystemService(android.content.Context.INPUT_METHOD_SERVICE);
    if (manager != null) manager.showInputMethodPicker();
  }
}
`);

  fs.writeFileSync(path.join(packageDir, "KeyboardPackage.java"), `${packageDecl}

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class KeyboardPackage implements ReactPackage {
  @Override
  public List<NativeModule> createNativeModules(ReactApplicationContext context) {
    List<NativeModule> modules = new ArrayList<>();
    modules.add(new KeyboardPreferencesModule(context));
    return modules;
  }

  @Override
  public List<ViewManager> createViewManagers(ReactApplicationContext context) {
    return Collections.emptyList();
  }
}
`);

  fs.writeFileSync(path.join(packageDir, "IosKeyInputMethodService.java"), `${packageDecl}

import android.inputmethodservice.InputMethodService;
import android.view.View;
import android.view.inputmethod.EditorInfo;

public class IosKeyInputMethodService extends InputMethodService {
  private IosKeyKeyboardView keyboardView;

  @Override
  public View onCreateInputView() {
    keyboardView = new IosKeyKeyboardView(this);
    return keyboardView;
  }

  @Override
  public void onStartInput(EditorInfo attribute, boolean restarting) {
    super.onStartInput(attribute, restarting);
    if (keyboardView != null) keyboardView.refreshState();
  }
}
`);

  fs.writeFileSync(path.join(packageDir, "IosKeyKeyboardView.java"), `${packageDecl}

import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RectF;
import android.view.MotionEvent;
import android.view.View;
import android.view.inputmethod.InputConnection;
import android.inputmethodservice.InputMethodService;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class IosKeyKeyboardView extends View {
  private final InputMethodService service;
  private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
  private final float density;
  private final String[] rows = {"qwertyuiop", "asdfghjkl", "⇧zxcvbnm⌫"};
  private final Map<String, String> corrections = new HashMap<>();
  private final String[] commonWords = {"que", "qual", "quando", "quer", "quero", "quem", "olá", "olhar", "obrigado", "obrigada", "você", "voce", "isso", "está", "esta", "para", "por", "com", "como", "muito", "mais", "agora", "também", "tambem", "teclado", "bonito", "leve", "sim", "não", "nao", "hello", "thanks"};
  private final Pattern wordPattern = Pattern.compile("([\\\\p{L}]+)$");
  private boolean suggestionsEnabled = true;
  private boolean autoCorrectEnabled = true;
  private int heightDp = 284;
  private int activeRow = -1;
  private int activeColumn = -1;

  public IosKeyKeyboardView(InputMethodService service) {
    super(service);
    this.service = service;
    this.density = getResources().getDisplayMetrics().density;
    setFocusable(true);
    corrections.put("vc", "você");
    corrections.put("voce", "você");
    corrections.put("tbm", "também");
    corrections.put("tambem", "também");
    corrections.put("nao", "não");
    corrections.put("obg", "obrigado");
    corrections.put("q", "que");
    refreshState();
  }

  private float dp(float value) { return value * density; }

  public void refreshState() {
    SharedPreferences preferences = service.getSharedPreferences("ioskey.preferences", Context.MODE_PRIVATE);
    heightDp = preferences.getInt("height", 284);
    suggestionsEnabled = preferences.getBoolean("suggestions", true);
    autoCorrectEnabled = preferences.getBoolean("autoCorrect", true);
    requestLayout();
    invalidate();
  }

  @Override
  protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
    int width = MeasureSpec.getSize(widthMeasureSpec);
    setMeasuredDimension(width, (int) dp(heightDp));
  }

  @Override
  protected void onDraw(Canvas canvas) {
    super.onDraw(canvas);
    boolean dark = "dark".equals(service.getSharedPreferences("ioskey.preferences", 0).getString("theme", "light"));
    canvas.drawColor(Color.parseColor(dark ? "#202126" : "#E8E8ED"));
    float width = getWidth();
    float suggestionHeight = suggestionsEnabled ? dp(38) : 0;
    if (suggestionsEnabled) drawSuggestions(canvas, width, suggestionHeight, dark);
    float top = suggestionHeight + dp(6);
    float bottom = getHeight() - dp(8);
    float rowHeight = Math.max(dp(31), (bottom - top - dp(26)) / 3f);
    for (int row = 0; row < 3; row++) drawLetterRow(canvas, row, top + row * (rowHeight + dp(4)), rowHeight, dark);
    drawBottomRow(canvas, bottom - dp(24), dp(24), dark);
  }

  private void drawSuggestions(Canvas canvas, float width, float height, boolean dark) {
    paint.setStyle(Paint.Style.FILL);
    paint.setColor(Color.parseColor(dark ? "#202126" : "#E8E8ED"));
    canvas.drawRect(0, 0, width, height, paint);
    paint.setColor(Color.parseColor(dark ? "#3B3C43" : "#C5C6CB"));
    canvas.drawRect(0, height - dp(1), width, height, paint);
    String[] suggestions = currentSuggestions();
    for (int i = 0; i < 3; i++) {
      float left = width * i / 3f;
      if (i == 1) {
        paint.setColor(Color.parseColor("#D8F56A"));
        canvas.drawRoundRect(new RectF(left + dp(6), dp(4), left + width / 3f - dp(6), height - dp(4)), dp(8), dp(8), paint);
      }
      paint.setColor(Color.parseColor(dark ? "#F5F1E8" : "#303238"));
      paint.setTextSize(dp(12));
      paint.setTextAlign(Paint.Align.CENTER);
      canvas.drawText(suggestions[i], left + width / 6f, height / 2f + dp(4), paint);
    }
    paint.setColor(Color.parseColor("#D8F56A"));
    canvas.drawCircle(width - dp(15), height / 2f, dp(4), paint);
  }

  private void drawLetterRow(Canvas canvas, int row, float top, float rowHeight, boolean dark) {
    String letters = rows[row];
    int count = letters.length();
    float gap = dp(5);
    float side = row == 1 ? dp(22) : dp(7);
    float keyWidth = (getWidth() - side * 2 - gap * (count - 1)) / count;
    for (int col = 0; col < count; col++) {
      float left = side + col * (keyWidth + gap);
      boolean action = row == 2 && (col == 0 || col == count - 1);
      boolean active = row == activeRow && col == activeColumn;
      paint.setStyle(Paint.Style.FILL);
      paint.setColor(Color.parseColor(active ? "#C4E557" : action ? (dark ? "#4B4C54" : "#D2D3D8") : (dark ? "#34353B" : "#FFFFFF")));
      canvas.drawRoundRect(new RectF(left, top, left + keyWidth, top + rowHeight), dp(6), dp(6), paint);
      paint.setColor(Color.parseColor(dark ? "#F5F1E8" : "#303238"));
      paint.setTextSize(dp(action ? 13 : 16));
      paint.setTextAlign(Paint.Align.CENTER);
      String label = letters.substring(col, col + 1);
      canvas.drawText(label, left + keyWidth / 2f, top + rowHeight / 2f + dp(6), paint);
    }
  }

  private void drawBottomRow(Canvas canvas, float top, float rowHeight, boolean dark) {
    float gap = dp(5);
    float side = dp(7);
    float small = dp(52);
    float space = getWidth() - side * 2 - gap * 2 - small * 2;
    drawBottomKey(canvas, side, top, small, rowHeight, "123", dark);
    drawBottomKey(canvas, side + small + gap, top, space, rowHeight, "português (BR)", dark);
    drawBottomKey(canvas, getWidth() - side - small, top, small, rowHeight, "↵", dark);
  }

  private void drawBottomKey(Canvas canvas, float left, float top, float width, float height, String label, boolean dark) {
    paint.setStyle(Paint.Style.FILL);
    paint.setColor(Color.parseColor(label.equals("português (BR)") ? (dark ? "#34353B" : "#FFFFFF") : (dark ? "#4B4C54" : "#D2D3D8")));
    canvas.drawRoundRect(new RectF(left, top, left + width, top + height), dp(6), dp(6), paint);
    paint.setColor(Color.parseColor(dark ? "#F5F1E8" : "#303238"));
    paint.setTextSize(dp(label.length() > 3 ? 10 : 13));
    paint.setTextAlign(Paint.Align.CENTER);
    canvas.drawText(label, left + width / 2f, top + height / 2f + dp(4), paint);
  }

  private String currentWord() {
    InputConnection input = service.getCurrentInputConnection();
    if (input == null) return "";
    CharSequence before = input.getTextBeforeCursor(64, 0);
    if (before == null) return "";
    Matcher matcher = wordPattern.matcher(before.toString().toLowerCase(Locale.ROOT));
    return matcher.find() ? matcher.group(1) : "";
  }

  private String[] currentSuggestions() {
    String word = currentWord();
    if (word.isEmpty()) return new String[] {"olá", "olá!", "olhar"};
    String[] result = new String[3];
    int found = 0;
    for (String candidate : commonWords) {
      if (candidate.startsWith(word) && !candidate.equals(word) && found < 3) result[found++] = candidate;
    }
    if (found == 0) result[found++] = word;
    while (found < 3) result[found] = found++ == 1 ? word : "";
    return result;
  }

  private void commitWord(String word) {
    InputConnection input = service.getCurrentInputConnection();
    if (input == null) return;
    String current = currentWord();
    if (!current.isEmpty()) input.deleteSurroundingText(current.length(), 0);
    input.commitText(word, 1);
    invalidate();
  }

  @Override
  public boolean onTouchEvent(MotionEvent event) {
    if (event.getAction() == MotionEvent.ACTION_DOWN || event.getAction() == MotionEvent.ACTION_MOVE) {
      float y = event.getY();
      int[] hit = hitKey(event.getX(), y);
      activeRow = hit[0]; activeColumn = hit[1]; invalidate(); return true;
    }
    if (event.getAction() == MotionEvent.ACTION_UP) {
      int[] hit = hitKey(event.getX(), event.getY());
      activeRow = -1; activeColumn = -1; handleKey(hit[0], hit[1], event.getX(), event.getY()); invalidate(); return true;
    }
    return true;
  }

  private int[] hitKey(float x, float y) {
    float suggestionHeight = suggestionsEnabled ? dp(38) : 0;
    if (suggestionsEnabled && y < suggestionHeight) return new int[] {-2, Math.min(2, (int) (x / (getWidth() / 3f)))};
    float top = suggestionHeight + dp(6);
    float bottom = getHeight() - dp(8);
    float rowHeight = Math.max(dp(31), (bottom - top - dp(26)) / 3f);
    for (int row = 0; row < 3; row++) {
      float rowTop = top + row * (rowHeight + dp(4));
      if (y >= rowTop && y <= rowTop + rowHeight) {
        String letters = rows[row];
        float side = row == 1 ? dp(22) : dp(7);
        float gap = dp(5);
        float keyWidth = (getWidth() - side * 2 - gap * (letters.length() - 1)) / letters.length();
        int col = (int) ((x - side) / (keyWidth + gap));
        return new int[] {row, Math.max(0, Math.min(letters.length() - 1, col))};
      }
    }
    float bottomTop = getHeight() - dp(8) - dp(24);
    if (y >= bottomTop) {
      float side = dp(7);
      float small = dp(52);
      if (x <= side + small) return new int[] {3, 0};
      if (x >= getWidth() - side - small) return new int[] {3, 2};
      return new int[] {3, 1};
    }
    return new int[] {-1, -1};
  }

  private void handleKey(int row, int column, float x, float y) {
    InputConnection input = service.getCurrentInputConnection();
    if (input == null) return;
    if (row == -2) {
      String[] suggestions = currentSuggestions();
      if (column < suggestions.length && !suggestions[column].isEmpty()) commitWord(suggestions[column]);
      return;
    }
    if (row == -1) return;
    if (row == 3) {
      if (column == 1) {
        if (autoCorrectEnabled) {
          String current = currentWord();
          String correction = corrections.get(current);
          if (correction != null && !correction.equals(current)) {
            input.deleteSurroundingText(current.length(), 0);
            input.commitText(correction, 1);
          }
        }
        input.commitText(" ", 1);
      } else if (column == 2) {
        input.commitText("\\n", 1);
      }
      return;
    }
    if (row == 2 && column == 0) return;
    if (row == 2 && column == rows[2].length() - 1) { input.deleteSurroundingText(1, 0); return; }
    String letters = rows[row];
    String value = letters.substring(column, column + 1);
    input.commitText(value, 1);
  }
}
`);

  fs.writeFileSync(path.join(xmlDir, "ioskey_method.xml"), `<input-method xmlns:android="http://schemas.android.com/apk/res/android">
  <subtype android:label="@string/ioskey_app_name" android:imeSubtypeLocale="pt_BR" android:imeSubtypeMode="keyboard" />
</input-method>
`);
  fs.writeFileSync(path.join(valuesDir, "ioskey_strings.xml"), `<resources>
  <string name="ioskey_app_name">iOSKey</string>
</resources>
`);

  const javaRoot = path.join(projectRoot, "app", "src", "main", "java");
  const files = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (entry.name === "MainApplication.kt" || entry.name === "MainApplication.java") files.push(file);
    }
  }
  walk(javaRoot);
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    fs.writeFileSync(file, registerPackage(source, packageName));
  }
}

const withNativeKeyboard = (config) => {
  const packageName = config.android?.package || "space.manus.ioskey";
  config = withAndroidManifest(config, (manifestConfig) => {
    const app = manifestConfig.modResults.manifest.application?.[0];
    if (!app) return manifestConfig;
    app.service = app.service || [];
    const serviceName = `${packageName}.keyboard.IosKeyInputMethodService`;
    const exists = app.service.some((service) => service.$?.["android:name"] === serviceName);
    if (!exists) {
      app.service.push({
        $: {
          "android:name": serviceName,
          "android:label": "@string/ioskey_app_name",
          "android:permission": "android.permission.BIND_INPUT_METHOD",
          "android:exported": "true",
        },
        "intent-filter": [{ action: [{ $: { "android:name": "android.view.InputMethod" } }] }],
        "meta-data": [{ $: { "android:name": "android.view.im", "android:resource": "@xml/ioskey_method" } }],
      });
    }
    return manifestConfig;
  });
  config = withMainApplication(config, (mainApplicationConfig) => {
    mainApplicationConfig.modResults.contents = registerPackage(mainApplicationConfig.modResults.contents, packageName);
    return mainApplicationConfig;
  });
  return withDangerousMod(config, ["android", async (dangerousConfig) => {
    writeAndroidSources(dangerousConfig, dangerousConfig.modRequest.platformProjectRoot);
    return dangerousConfig;
  }]);
};

module.exports = withNativeKeyboard;
