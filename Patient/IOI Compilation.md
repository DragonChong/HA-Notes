# IOI Compilation

This makefile is used to compile several C programs that appear to be part of a system called LAPS (Laboratory Admission Processing System) that interfaces with Sybase databases. Let me explain the compilation process:

## Overall Compilation Flow

1. **Preprocessing**: The makefile first preprocesses embedded SQL/C files (`.cp` files) using a Sybase preprocessor called `cpre64`
2. **Compilation**: It then compiles both regular C files and the preprocessed files using `xlc_r` compiler
3. **Linking**: Finally, it links the compiled object files together with Sybase libraries to create executable programs
4. **Deployment**: The executables are moved from a temporary directory to the output directory

## Key Components

### Compilers and Tools

- **C Compiler**: `xlc_r -g -q64 -DSYB_LP64 -D_THREAD_SAFE` (IBM XL C compiler with 64-bit compilation and thread safety)
- **SQL Preprocessor**: `$${ESQL}/bin/cpre64 -l` (Sybase embedded SQL preprocessor)

### Compilation Flags

- **C Flags**: `$(INCLUDE)` for including header files
- **Sybase Flags**: `$(SYBINCLUDE) $(LIBFLAGS)` for Sybase-specific includes and libraries

### Directory Structure

- **Source files**: Located in `../src`
- **Header files**: Located in `../src`
- **Output directory**: `../work`
- **Temporary directory**: `/tmp`

## Compilation Steps for a Typical Program

Let's take the example of `laps_download` (TARGET1):

1. **Preprocessing SQL Files**:

First, any embedded SQL files (`.cp` files) needed are preprocessed:

```other
$(QPRECOMP) $(QPRECOMPFLAG1) -O$@ $(SRC)/$(SQLPRG1).cp
```

This converts Sybase embedded SQL syntax into standard C code.

2. **Compiling C Files**:

The main program and supporting modules are compiled:

```other
$(CC) $(CFLAGS) -o $@ -c $(SRC)/$(TARGET1).c
$(CC) $(CFLAGS) -o $@ -c $(SRC)/$(SUPPRG1).c
$(CC) $(CFLAGS) -o $@ -c $(SRC)/$(SUPPRG2).c
$(CC) $(CFLAGS) -o $@ -c $(SRC)/$(SUPPRG3).c
```

3. **Compiling Preprocessed SQL Files**:

```other
$(CC) $(SYBFLAGS) -o $@ -c $(SRC)/$(SQLPRG1).c
```

4. **Linking**:

All object files and libraries are linked together:

```other
$(CC) $(SYBFLAGS) -o $@ $(TARGET1).o \
$(SUPPRG1).o $(SUPPRG2).o $(SUPPRG3).o \
$(SQLPRG0).o $(SQLPRG1).o $(SQLPRG2).o $(SQLPRG3).o $(SCKLIBS)
```

The `$(SCKLIBS)` includes Sybase libraries (`-lsybct_r64 -lsybtcl_r64` etc.) and math library (`-lm`).

5. **Deployment**:

```other
mv $(TEMP)/$(TARGET1) $(OUTPUT)/$(TARGET1)
```

Moves the executable from the temporary location to the output directory.

## Dependencies

The makefile carefully tracks dependencies between source, headers, and object files. For example:

```other
$(TARGET1).o : $(SRC)/$(TARGET1).c $(HEADER)/$(HEADER1) $(HEADER)/$(HEADER2)
```

This ensures that if any header file changes, the relevant source files will be recompiled.

## Special Considerations

- The makefile is configured for 64-bit compilation (`-q64`)
- Thread safety is enabled (`-D_THREAD_SAFE`)
- Sybase-specific settings for large pointer support (`-DSYB_LP64`)
- Debug information is included (`-g`)

This makefile represents a mature build system designed for compiling C programs that interact with a Sybase database in a multi-threaded environment.